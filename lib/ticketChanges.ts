import { EventEmitter } from 'node:events';

/*
 * In-process pub/sub between the ticket write endpoints and the open
 * /api/tickets/stream connections.
 */

// ponytail: in-process bus. Railway runs a single instance, so every ticket
// write and every open stream share this process. Replicas (or Vercel) need a
// shared bus behind these same two functions: Postgres NOTIFY over the pg pool
// we already have, or Redis.

// Hoisted onto globalThis because Turbopack inlines this module into every API
// route's chunk (8 copies in `next build`), so a plain module-level emitter
// would never connect a write to a stream. Also survives dev HMR reloads.
// Same trick as the Prisma client in ./prisma.
const store = globalThis as typeof globalThis & {
  ticketChanges?: EventEmitter;
};

// One listener per open stream, so the default 10-listener warning is noise.
const bus = (store.ticketChanges ??= new EventEmitter().setMaxListeners(0));

export const notifyTicketChange = () => {
  bus.emit('change');
};

/** Returns the unsubscribe function. */
export const onTicketChange = (listener: () => void) => {
  bus.on('change', listener);
  return () => {
    bus.off('change', listener);
  };
};
