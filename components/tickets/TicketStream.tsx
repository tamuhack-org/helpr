import { Ticket } from '@prisma/client';
import { useState, useEffect } from 'react';
import { getTimeDifferenceString } from '../../lib/common';
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

export const TicketStream = ({ filter }: { filter: string }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('STARTING SSE connection to:', `/api/tickets/${filter || 'active'}`);
    const eventSource = new EventSource(`/api/tickets/${filter || 'active'}`);

    eventSource.onopen = () => {
      console.log('SSE connection opened');
    };

    eventSource.onmessage = (event) => {
      try {
        console.log('SSE message received:', event.data);
        
        // Skip heartbeat messages
        if (event.data.trim() === '') {
          return;
        }

        const data = JSON.parse(event.data);
        if (data.error) {
          console.error('Server error:', data.error);
          setError(data.error);
        } else if (data.tickets) {
          console.log('Received tickets:', data.tickets.length);
          setTickets(data.tickets);
          setError(null);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error parsing SSE data:', err, 'Raw data:', event.data);
        // Don't set error for heartbeat or empty messages
        if (event.data.trim() !== '') {
          setError('Failed to parse server data');
        }
        setIsLoading(false);
      }
    };

    eventSource.onerror = (event) => {
      console.error('SSE error:', event);
      console.error('EventSource readyState:', eventSource.readyState);
      
      // Only set error if the connection is permanently closed
      if (eventSource.readyState === EventSource.CLOSED) {
        setError('Connection error');
        setIsLoading(false);
      } else {
        console.log('SSE connection will automatically retry...');
      }
    };

    return () => {
      eventSource.close();
    };
  }, [filter]);

  if (isLoading) {
    return <TextCard text="Loading..." />;
  }

  if (error) {
    return <TextCard text="Error" />;
  }

  if (!tickets.length) {
    return <TextCard text="No Tickets" />;
  }

  return (
    <>
      {tickets.map((ticket: Ticket, index: number) => (
        <Ticket ticket={ticket} key={index} filter={filter}></Ticket>
      ))}
    </>
  );
};
