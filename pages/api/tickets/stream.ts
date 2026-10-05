import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { onTicketChange } from '../../../lib/ticketChanges';

/*
 * GET Request: Server-Sent Events stream that fires whenever a ticket changes.
 * No ticket data is sent; clients revalidate the existing ticket endpoints,
 * which already handle auth and filtering.
 */

// A named event rather than an SSE comment so the client watchdog can see it,
// and frequent enough that no proxy on the way treats the socket as idle.
const HEARTBEAT_MS = 10_000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  if (!(await getToken({ req }))) {
    res.status(401).end();
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    // no-transform keeps Next's compression middleware from buffering frames.
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const notify = () => res.write('data: change\n\n');
  const unsubscribe = onTicketChange(notify);
  const heartbeat = setInterval(
    () => res.write('event: ping\ndata: 0\n\n'),
    HEARTBEAT_MS
  );
  const stop = () => {
    clearInterval(heartbeat);
    unsubscribe();
  };

  // `res` is the connection-bound stream (`req` ends with the request body), so
  // its 'close' is the client going away. The error listener keeps a write to a
  // dying socket from surfacing as an unhandled 'error' event.
  res.on('close', stop).on('error', stop);

  // The first frame doubles as the catch-up cue: clients revalidate on every
  // message, so a reconnecting tab picks up whatever changed while it was out.
  res.write('retry: 3000\n\n');
  notify();
}
