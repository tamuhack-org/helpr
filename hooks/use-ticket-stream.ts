import { useSyncExternalStore } from 'react';
import { mutate } from 'swr';

const STREAM_URL = '/api/tickets/stream';

// The server closes each stream before the serverless duration limit, so a
// reconnect every ~50s is normal. Ride it out before reporting a drop.
const DROP_GRACE_MS = 5000;

// The server emits a change or a heartbeat every 2s. A socket that stays open
// while the other end has gone quiet (sleeping laptop, dropped NAT mapping,
// wedged database) is the failure that silently stops updates, so treat four
// missed beats as dead rather than trusting the connection.
const HEARTBEAT_TIMEOUT_MS = 8000;

// One stream per tab, shared by every component that asks for it, kept in a
// module-level store so `useSyncExternalStore` can hand out a tear-free
// snapshot and the connection count never depends on the render tree.
const listeners = new Set<() => void>();

let source: EventSource | null = null;
let subscribers = 0;
let connected = false;
let dropTimer: number | undefined;
let heartbeatTimer: number | undefined;

const publish = (next: boolean) => {
  if (connected === next) {
    return;
  }

  connected = next;
  listeners.forEach((notify) => notify());
};

const closeStream = () => {
  window.clearTimeout(dropTimer);
  window.clearTimeout(heartbeatTimer);
  dropTimer = undefined;
  heartbeatTimer = undefined;
  source?.close();
  source = null;
  publish(false);
};

const openStream = () => {
  // A hidden tab has nothing to render and would still hold the server in its
  // polling loop, so it stays closed until the tab comes back.
  if (source || document.visibilityState === 'hidden') {
    return;
  }

  const stream = new EventSource(STREAM_URL);

  const awaitNextBeat = () => {
    window.clearTimeout(heartbeatTimer);
    heartbeatTimer = window.setTimeout(() => {
      // Already late, so no grace period here: drop to polling and start over
      // on a fresh connection.
      closeStream();
      openStream();
    }, HEARTBEAT_TIMEOUT_MS);
  };

  // Deliberately not keyed off `onopen`: the server opens the stream before it
  // knows whether the database answers, so only a delivered event proves the
  // connection is live.
  stream.onmessage = () => {
    window.clearTimeout(dropTimer);
    dropTimer = undefined;
    awaitNextBeat();
    publish(true);
    mutate(
      (key) =>
        typeof key === 'string' &&
        (key.startsWith('/api/tickets') || key === '/api/users/me')
    );
  };

  // Heartbeats prove liveness without touching any cache.
  stream.addEventListener('ping', awaitNextBeat);

  stream.onerror = () => {
    // Never restart the timer: a stream that keeps failing retries every 3s,
    // and rescheduling on each retry would starve the timeout forever. The
    // clock runs from the first failure until an event actually arrives.
    if (dropTimer !== undefined) {
      return;
    }

    dropTimer = window.setTimeout(() => publish(false), DROP_GRACE_MS);
  };

  source = stream;
  awaitNextBeat();
};

const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    closeStream();
    return;
  }

  // Every fresh connection is answered with the current ticket fingerprint, so
  // reopening also catches up on whatever changed while the tab was hidden.
  openStream();
};

const subscribe = (onStoreChange: () => void) => {
  listeners.add(onStoreChange);

  if (++subscribers === 1) {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    openStream();
  }

  return () => {
    listeners.delete(onStoreChange);

    if (--subscribers === 0) {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      closeStream();
    }
  };
};

/**
 * Subscribes to the ticket stream and revalidates the ticket-related SWR caches
 * whenever the server reports a change. Returns whether events are actually
 * arriving, so callers can fall back to polling while they are not.
 */
export const useTicketStream = () =>
  useSyncExternalStore(
    subscribe,
    () => connected,
    () => false
  );
