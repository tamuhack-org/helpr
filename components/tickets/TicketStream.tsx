import type { Ticket } from '@/generated/prisma/client';
import { useTicketStream } from '@/hooks/use-ticket-stream';
import { MdLink, MdLinkOff } from 'react-icons/md';
import useSWR from 'swr';
import { fetcher, getTimeDifferenceString } from '../../lib/common';
import { TextCard } from '../common/TextCard';
import { ClaimButton } from '../mentor/ClaimButton';

const Ticket = ({ ticket, filter }: { ticket: Ticket; filter: string }) => {
  return (
    <div className="relative block p-4 sm:p-8 bg-white border border-gray-100 shadow-md rounded-xl my-8 w-full">
      <span className="absolute right-4 top-4 rounded-full px-3 py-1.5 bg-green-100 text-green-600 font-medium text-xs">
        {getTimeDifferenceString(ticket.publishTime)}
      </span>
      <div className=" text-gray-500 sm:pr-8">
        <h5 className="w-3/4 text-xl font-bold text-gray-900">
          {ticket.issue}
        </h5>
        <p className="mt-2 text-sm">
          {ticket.authorName} (Phone: {ticket.contact})
        </p>
        <p className="mt-2 text-sm">Located at: {ticket.location}</p>
      </div>
      <ClaimButton ticket={ticket} filter={filter} />
    </div>
  );
};

const Tickets = ({
  filter,
  connected,
}: {
  filter: string;
  connected: boolean;
}) => {
  const {
    data: ticketsData,
    error: ticketError,
    isLoading: isTicketLoading,
  } = useSWR(`/api/tickets/${filter || 'active'}`, fetcher, {
    // The stream is the fast path; polling only covers a dropped connection.
    refreshInterval: connected ? 0 : 5000,
  });

  if (isTicketLoading) {
    return <TextCard text="Loading..." />;
  }

  if (ticketError) {
    return <TextCard text="Error" />;
  }

  if (!ticketsData.tickets.length) {
    return <TextCard text="No Tickets" />;
  }

  return ticketsData.tickets.map((ticket: Ticket, index: number) => (
    <Ticket ticket={ticket} key={index} filter={filter}></Ticket>
  ));
};

export const TicketStream = ({ filter }: { filter: string }) => {
  const connected = useTicketStream();

  return (
    <>
      <div className="flex justify-end pt-3 -mb-4">
        {connected ? (
          <MdLink
            className="text-green-500"
            title="Live updates connected"
            aria-label="Live updates connected"
          />
        ) : (
          <MdLinkOff
            className="text-gray-400"
            title="Live updates disconnected, falling back to refresh"
            aria-label="Live updates disconnected"
          />
        )}
      </div>
      <Tickets filter={filter} connected={connected} />
    </>
  );
};
