import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { getActiveEvent } from '../../../lib/eventHelper';
import prisma from '../../../lib/prisma';

/*
 * GET Request: Server-Sent Events stream that pings clients whenever the
 * ticket table changes. No ticket data is sent; clients revalidate the
 * existing ticket endpoints, which already handle auth and filtering.
 */

// ponytail: server-side fingerprint poll instead of a pub/sub bus. This app
// deploys to Vercel, where every request can land on a different instance, so
// an in-process EventEmitter would miss writes and Postgres LISTEN/NOTIFY does
// not survive a pgbouncer-pooled connection string. Swap in Redis/NOTIFY if
// this aggregate ever shows up in DB load.
const POLL_MS = 2000;

// Vercel kills long functions; close cleanly and let EventSource reconnect.
const MAX_STREAM_MS = 50_000;
export const maxDuration = 60;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const token = await getToken({ req });

  if (!token) {
    return res.status(401).end();
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write('retry: 3000\n\n');

  let closed = false;
  req.on('close', () => {
    closed = true;
  });

  const deadline = Date.now() + MAX_STREAM_MS;
  let last = '';

  while (!closed && Date.now() < deadline) {
    try {
      const activeEvent = await getActiveEvent();
      const { _count, _max } = await prisma.ticket.aggregate({
        where: { eventId: activeEvent?.id },
        _count: { _all: true },
        _max: { updatedTime: true },
      });

      // Count catches inserts/deletes, max(updatedTime) catches edits.
      const current = `${_count._all}:${_max.updatedTime?.getTime() ?? 0}`;

      if (current === last) {
        res.write(': ping\n\n');
      } else {
        last = current;
        res.write(`data: ${current}\n\n`);
      }
    } catch (error) {
      console.error('Error reading ticket state for SSE:', error);
      res.write(': error\n\n');
    }

    const { promise, resolve } = Promise.withResolvers<void>();
    setTimeout(resolve, POLL_MS);
    await promise;
  }

  res.end();
}
