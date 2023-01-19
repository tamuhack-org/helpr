import React from 'react';
import useSWR from 'swr';
import { fetcher } from '../../lib/common';
import { getTimeDifferenceString } from '../../lib/common';
import { Ticket } from '@prisma/client';
import ClaimButton from '../mentor/ClaimButton';

export default function TicketStream(props: { filter: string }) {
  const {
    data: ticketsData,
    error: ticketError,
    isLoading: isTicketLoading,
  } = useSWR(`/api/tickets/${props.filter || 'all'}`, fetcher, {});

  if (isTicketLoading) {
    return (
      <div className="flex justify-center p-8 bg-white border border-gray-100 shadow-md rounded-xl my-8">
        <p className="text-xl font-bold">Loading...</p>
      </div>
    );
  }

  if (ticketError) {
    return (
      <div className="flex justify-center p-8 bg-white border border-gray-100 shadow-md rounded-xl my-8">
        <p className="text-xl font-bold">Error!</p>
      </div>
    );
  }

  const ticketList: JSX.Element[] = [];
  ticketsData.tickets.map((ticket: Ticket, index: number) => {
    ticketList.push(
      <div
        key={index}
        className="relative block p-4 sm:p-8 bg-white border border-gray-100 shadow-md rounded-xl my-8 md:w-[90vw] lg:w-[35vw] 2xl:w-[500px]"
      >
        <span className="absolute right-4 top-4 rounded-full px-3 py-1.5 bg-green-100 text-green-600 font-medium text-xs">
          {getTimeDifferenceString(ticket.publishTime)}
        </span>
        <div className=" text-gray-500 sm:pr-8">
          <h5 className="w-3/4 text-xl font-bold text-gray-900">
            {ticket.issue}
          </h5>
          <p className="mt-2 text-sm">
            {ticket.authorName} (Contact: {ticket.contact})
          </p>
          <p className="mt-2 text-sm">Located at: {ticket.location}</p>
        </div>
        <ClaimButton ticket={ticket} />
      </div>
    );
  });

  return (
    <div>
      {ticketList.length == 0 ? (
        <div className="flex justify-center p-8 bg-white border border-gray-100 shadow-md rounded-xl my-8">
          <p className="text-xl font-bold">No Tickets!</p>
        </div>
      ) : (
        ticketList
      )}
    </div>
  );
}
