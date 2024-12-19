import React from 'react';
import { fetcher } from '../../../lib/common';
import useSWR from 'swr';
import { Skeleton, Stat, StatHelpText, StatLabel, StatNumber } from '@chakra-ui/react';

export function MiniTotalTicketsResolved({ email }: { email: string }) {
  const { data, error, isLoading } = useSWR(`/api/analytics/tickets/mentorresolved?email=${email}`,
    fetcher,
    {}
  );

  if (error) {
    return <p>Error</p>;
  }

  const totalTicketsResolved = data ? data.tickets.length : 0;

  return (
    <div className="flex shrink-0 gap-4 border-[1px] border-gray-200 rounded-lg text-sm p-4 md:w-[150px]">
      <Stat>
        <StatLabel className="mb-4">Total</StatLabel>
        <Skeleton isLoaded={!isLoading}>
          <StatNumber>{totalTicketsResolved}</StatNumber>
        </Skeleton>
        <StatHelpText className="mt-1">Tickets Resolved</StatHelpText>
      </Stat>
    </div>
  );
}
