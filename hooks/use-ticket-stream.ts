import { useEffect, useState } from 'react';
import { useSWRConfig } from 'swr';

// Subscribes to /api/tickets/stream and revalidates the ticket-related SWR
// caches whenever the server reports a change. Returns the connection state so
// callers can fall back to polling while disconnected.
// ponytail: one EventSource per calling component. Only one such component is
// mounted per page today; add a provider if that stops being true.
export const useTicketStream = () => {
  const { mutate } = useSWRConfig();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const source = new EventSource('/api/tickets/stream');

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.onmessage = () => {
      setConnected(true);
      mutate(
        (key) =>
          typeof key === 'string' &&
          (key.startsWith('/api/tickets') || key === '/api/users/me')
      );
    };

    return () => source.close();
  }, [mutate]);

  return connected;
};
