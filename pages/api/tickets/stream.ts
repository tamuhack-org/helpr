import { setTimeout as sleep } from 'node:timers/promises';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import prisma from '../../../lib/prisma';

/*
 * GET Request: Server-Sent Events stream that notifies clients whenever the
 * ticket table changes. No ticket data is sent; clients revalidate the existing
 * ticket endpoints, which already handle auth and filtering.
 */

// ponytail: server-side fingerprint poll instead of a pub/sub bus. This app
// deploys to Vercel, where every request can land on a different instance, so
// an in-process EventEmitter would miss writes and Postgres LISTEN/NOTIFY does
// not survive a pgbouncer-pooled connection string. Swap in Redis/NOTIFY if
// this aggregate ever shows up in DB load.
const POLL_MS = 2000;

// Vercel kills long functions; close cleanly and let EventSource reconnect.
const MAX_STREAM_MS = 50_000;

// Postgres cancels the read itself, so a blocked database returns a real error
// and frees the pooled connection instead of leaving a statement behind. Sent
// per transaction with SET LOCAL rather than as a pool-wide startup parameter:
// the blast radius stays on this endpoint and it survives a transaction-pooling
// proxy, which can reject unknown startup parameters.
const QUERY_TIMEOUT_MS = 4000;

// Prisma aborts a transaction on its own clock too, and that path reports an
// expired transaction without Postgres ever cancelling the statement. Keep it
// strictly slower so the database is always the one that gives up first.
const TRANSACTION_TIMEOUT_MS = 8000;

// Pages Router functions read the duration off the config export, not a named
// `maxDuration` export.
export const config = { maxDuration: 60 };

type Fingerprint = { tickets: number; changed: Date | null };

// Every stream on this instance shares one in-flight read. Ten mentors cost one
// query per tick instead of ten, and an unreachable database can only ever hold
// a single query, so reconnects cannot pile them up in the pool.
let inflight: Promise<Fingerprint> | null = null;

const readFingerprint = () => {
  inflight ??= prisma
    .$transaction(
      async (tx) => {
        await tx.$executeRawUnsafe(
          `SET LOCAL statement_timeout = ${QUERY_TIMEOUT_MS}`
        );

        // One statement, so the active event and its tickets come from the same
        // snapshot. The `NOT EXISTS` branch mirrors /api/tickets/*, which fall
        // back to every ticket when no event is active.
        const [fingerprint] = await tx.$queryRaw<Fingerprint[]>`
          WITH active AS (
            SELECT id FROM "Event"
            WHERE "isActive"
            ORDER BY "createdTime" DESC
            LIMIT 1
          )
          SELECT count(*)::int AS tickets, max("updatedTime") AS changed
          FROM "Ticket"
          WHERE "eventId" = (SELECT id FROM active)
             OR NOT EXISTS (SELECT 1 FROM active)
        `;

        return fingerprint;
      },
      { timeout: TRANSACTION_TIMEOUT_MS }
    )
    .finally(() => {
      inflight = null;
    });

  return inflight;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  const token = await getToken({ req });

  if (!token) {
    res.status(401).end();
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write('retry: 3000\n\n');

  // `res` is the connection-bound stream; `req` completes as soon as the client
  // finished sending the (empty) request body. Without the error listener, a
  // write to an already-destroyed socket would surface as an unhandled error
  // event and take the server process down.
  const disconnected = new AbortController();
  res.on('close', () => disconnected.abort());
  res.on('error', () => disconnected.abort());

  const deadline = Date.now() + MAX_STREAM_MS;
  let last = '';

  while (!disconnected.signal.aborted && Date.now() < deadline) {
    try {
      const fingerprint = await readFingerprint();

      // Count catches inserts and deletes, max(updatedTime) catches edits.
      const current = `${fingerprint.tickets}:${
        fingerprint.changed?.getTime() ?? 0
      }`;

      if (current === last) {
        // A named event, not an SSE comment: the client has to be able to see
        // the heartbeat to tell a live stream from a silently stalled one.
        res.write('event: ping\ndata: 0\n\n');
      } else {
        last = current;
        res.write(`data: ${current}\n\n`);
      }
    } catch (error) {
      // Close the stream rather than keep it open in a broken state: a client
      // that still holds an open connection trusts it and stops polling. The
      // client reconnects, and its heartbeat watchdog covers the window where
      // an unreachable database answers neither us nor Postgres' own timeout.
      console.error('Error reading ticket state for SSE:', error);
      break;
    }

    try {
      await sleep(POLL_MS, undefined, { signal: disconnected.signal });
    } catch {
      // The client went away mid-tick.
      break;
    }
  }

  res.end();
}
