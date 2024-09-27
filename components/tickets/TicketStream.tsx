import { Ticket } from '@prisma/client';
import useSWR from 'swr';
import { fetcher, getTimeDifferenceString } from '../../lib/common';
import { TextCard } from '../common/TextCard';
import { ClaimButton } from '../mentor/ClaimButton';

const Ticket = ({ ticket }: { ticket: Ticket }) => {
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
      <ClaimButton ticket={ticket} />
    </div>
  );
};

export const TicketStream = ({ filter }: { filter: string }) => {
  const {
    data: ticketsData,
    error: ticketError,
    isLoading: isTicketLoading,
  } = useSWR(`/api/tickets/${filter || 'active'}`, fetcher, {
    refreshInterval: 5000,
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
    <Ticket ticket={ticket} key={index}></Ticket>
  ));
};
