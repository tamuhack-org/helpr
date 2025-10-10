import React from 'react';
import { fetcher } from '../../../lib/common';
import useSWR from 'swr';
import {
  Skeleton,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';

import useEventStore from '@/stores/useEventStore';

export function MiniTotalTicketsCreated({
  userId,
}: {
  userId: string | undefined;
}) {
  const { activeEvent } = useEventStore((state) => state);
  const { data, error, isLoading } = useSWR(
    activeEvent?.id
      ? `/api/analytics/tickets/usercreated?userId=${userId}&eventId=${activeEvent.id}`
      : `/api/analytics/tickets/usercreated?userId=${userId}`,
    fetcher,
    {}
  );

  if (error) {
    return <p>Error</p>;
  }

  const totalTicketsCreated = data ? data.totalTicketsCreated : 0;

  return (
    <div className="flex flex-shrink-0 gap-4 border-[1px] border-gray-200 rounded-lg text-sm p-4 md:w-[150px]">
      <Stat>
        <StatLabel className="mb-4">Total</StatLabel>
        <Skeleton isLoaded={!isLoading}>
          <StatNumber>{totalTicketsCreated}</StatNumber>
        </Skeleton>
        <StatHelpText className="mt-1">Tickets Created</StatHelpText>
      </Stat>
    </div>
  );
}
