import { useSyncExternalStore } from 'react';
import { mutate } from 'swr';

// The server heartbeats every 10s. A socket that stays open after the other end
// went quiet (sleeping laptop, dropped NAT mapping) is the failure that silently
// stops updates, so three missed beats count as dead.
const HEARTBEAT_TIMEOUT_MS = 30_000;

// One stream per tab, shared by every component that asks for it, kept in a
// module-level store so `useSyncExternalStore` can hand out a tear-free
// snapshot and the connection count never depends on the render tree.
const listeners = new Set<() => void>();

let source: EventSource | null = null;
let subscribers = 0;
let connected = false;
let watchdog: number | undefined;

const publish = (next: boolean) => {
  if (connected === next) {
    return;
  }

  connected = next;
  listeners.forEach((notify) => notify());
};

const closeStream = () => {
  window.clearTimeout(watchdog);
  source?.close();
  source = null;
  publish(false);
};

const openStream = () => {
  // A hidden tab has nothing to render; it reconnects, and catches up, when it
  // comes back.
  if (source || document.visibilityState === 'hidden') {
    return;
  }

  const armWatchdog = () => {
    window.clearTimeout(watchdog);
    watchdog = window.setTimeout(() => {
      closeStream();
      openStream();
    }, HEARTBEAT_TIMEOUT_MS);
  };

  const beat = () => {
    armWatchdog();
    publish(true);
  };

  source = new EventSource('/api/tickets/stream');
  source.addEventListener('ping', beat);

  // The server sends a message on connect and on every ticket write, so each
  // one is a cue to revalidate; the first also catches up on anything missed
  // while disconnected.
  source.onmessage = () => {
    beat();
    mutate(
      (key) =>
        typeof key === 'string' &&
        (key.startsWith('/api/tickets') || key === '/api/users/me')
    );
  };

  // EventSource reconnects by itself, or stays closed after a non-200 (401, or
  // the 503 on Vercel) until the watchdog reopens it. Either way polling covers
  // the gap until the next message proves the stream is live.
  source.onerror = () => publish(false);

  armWatchdog();
};

const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    closeStream();
    return;
  }

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
