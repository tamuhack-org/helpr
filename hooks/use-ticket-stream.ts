import { useEffect, useState } from 'react';
import { useSWRConfig } from 'swr';

// The server closes each stream before the serverless duration limit, so a
// reconnect every ~50s is normal. Ride it out before reporting a drop.
const DROP_GRACE_MS = 5000;

// Subscribes to /api/tickets/stream and revalidates the ticket-related SWR
// caches whenever the server reports a change. Returns whether events are
// actually arriving, so callers can fall back to polling while they are not.
// ponytail: one EventSource per calling component. Only one such component is
// mounted per page today; add a provider if that stops being true.
export const useTicketStream = () => {
  const { mutate } = useSWRConfig();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const source = new EventSource('/api/tickets/stream');
    let dropTimer: number | undefined;

    // Deliberately not keyed off `onopen`: the server opens the stream before
    // it knows whether the database answers, so only a delivered event proves
    // the connection is live.
    source.onmessage = () => {
      window.clearTimeout(dropTimer);
      dropTimer = undefined;
      setConnected(true);
      mutate(
        (key) =>
          typeof key === 'string' &&
          (key.startsWith('/api/tickets') || key === '/api/users/me')
      );
    };

    source.onerror = () => {
      // Never restart the timer: a stream that keeps failing retries every 3s,
      // and rescheduling on each retry would starve the timeout forever. The
      // clock runs from the first failure until an event actually arrives.
      if (dropTimer !== undefined) {
        return;
      }

      dropTimer = window.setTimeout(() => setConnected(false), DROP_GRACE_MS);
    };

    return () => {
      window.clearTimeout(dropTimer);
      source.close();
    };
  }, [mutate]);

  return connected;
};
