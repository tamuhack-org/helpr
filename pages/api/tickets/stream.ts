import { setTimeout as sleep } from 'node:timers/promises';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { getActiveEvent } from '../../../lib/eventHelper';
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

// Pages Router functions read the duration off the config export, not a named
// `maxDuration` export.
export const config = { maxDuration: 60 };

// Every stream on this instance shares one in-flight read: ten mentors cost one
// query per tick instead of ten, and a wedged database can only ever hold a
// single hung query, so reconnects cannot pile them up in the pool. The client
// heartbeat watchdog drops the UI to polling within 8s of a stall.
let inflight: Promise<string> | null = null;

const readFingerprint = () => {
  inflight ??= (async () => {
    const activeEvent = await getActiveEvent();

    // `eventId: undefined` drops the filter, so with no active event this
    // counts every ticket, exactly like the /api/tickets/* list endpoints.
    const { _count, _max } = await prisma.ticket.aggregate({
      where: { eventId: activeEvent?.id },
      _count: { _all: true },
      _max: { updatedTime: true },
    });

    // tickets count catches inserts and deletes, max(updatedTime) edits.
    return `${_count._all}:${_max.updatedTime?.getTime() ?? 0}`;
  })().finally(() => {
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
      const current = await readFingerprint();

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
      // that still holds an open connection trusts it and stops polling.
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
