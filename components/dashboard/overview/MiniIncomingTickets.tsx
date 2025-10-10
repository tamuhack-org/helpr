import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { fetcher } from '../../../lib/common';
import useSWR from 'swr';
import { Ticket } from '@prisma/client';
import { Skeleton } from '@chakra-ui/react';

import useEventStore from '@/stores/useEventStore';

function emptyPoints(count: number) {
  return Array.from({ length: count }, () => ({ Tickets: 0 }));
}

export function createDataPoints(data: [Ticket], hoursAgo = 6) {
  const times = data.map((ticket) => new Date(ticket.publishTime));

  const currentTime = new Date();

  const xHoursAgo = new Date(currentTime.getTime() - hoursAgo * 60 * 60 * 1000);

  const timesWithinLastXHours = times.filter((time) => time >= xHoursAgo);

  const timesPerHour: { [hour: number]: number } = {};

  timesWithinLastXHours.forEach((time) => {
    const hour = time.getHours();
    const hourRelativeToXHoursAgo = (hour - xHoursAgo.getHours() + 24) % 24;
    timesPerHour[hourRelativeToXHoursAgo - 1] =
      (timesPerHour[hourRelativeToXHoursAgo - 1] || 0) + 1;
  });

  // Generate the final result in the desired format, substituting 0 for missing hours
  const datapoints = Array.from({ length: 6 }, (_, hour) => ({
    Tickets: timesPerHour[hour] || 0,
  }));

  return datapoints;
}

export function MiniIncomingTickets() {
  const { activeEvent } = useEventStore((state) => state);
  const { data, error, isLoading } = useSWR(
    activeEvent?.id
      ? `/api/analytics/tickets/incoming?eventId=${activeEvent.id}`
      : '/api/analytics/tickets/incoming',
    fetcher,
    {}
  );

  if (error) {
    return <p>Error</p>;
  }
  const points = data ? createDataPoints(data.tickets) : emptyPoints(6);

  return (
    <div className="flex flex-shrink-0 gap-4 border-[1px] border-gray-200 rounded-lg text-sm p-4">
      <div>
        <p>Incoming</p>
        <Skeleton isLoaded={!isLoading}>
          <p className="mt-8 font-bold text-lg">
            {points.reduce(
              (count, obj) => (obj.Tickets !== 0 ? count + obj.Tickets : count),
              0
            )}
          </p>
        </Skeleton>
        <p>Recent Tickets</p>
      </div>
      <div className="w-[100px] h-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            width={200}
            height={60}
            data={points}
            margin={{
              top: 5,
              right: 0,
              left: 0,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="Tickets"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorUv)"
            />

            <Tooltip />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MiniResolvedTickets({ id }: { id?: string }) {
  const { activeEvent } = useEventStore((state) => state);
  const { data, error, isLoading } = useSWR(
    id
      ? activeEvent?.id
        ? `/api/analytics/tickets/mentorresolved?email=${id}&eventId=${activeEvent.id}`
        : `/api/analytics/tickets/mentorresolved?email=${id}`
      : activeEvent?.id
        ? `/api/tickets/resolved?eventId=${activeEvent.id}`
        : '/api/tickets/resolved',
    fetcher,
    {}
  );

  if (error) {
    return <p>Error</p>;
  }

  let points = [];
  if (data) {
    if (id) {
      points = createDataPoints(data.tickets, 24);
    } else {
      points = createDataPoints(data.tickets);
    }
  } else {
    points = emptyPoints(6);
  }

  return (
    <div className="flex flex-shrink-0 gap-4 border-[1px] border-gray-200 rounded-lg text-sm p-4">
      <div>
        <p>Resolved</p>
        <Skeleton isLoaded={!isLoading}>
          <p className="mt-8 font-bold text-lg">
            {points.reduce(
              (count, obj) => (obj.Tickets !== 0 ? count + obj.Tickets : count),
              0
            )}
          </p>
        </Skeleton>
        <p>Recent Tickets</p>
      </div>
      <div className={`${id ? 'w-[200px]' : 'w-[100px]'} h-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            width={id ? 400 : 200}
            height={60}
            data={points}
            margin={{
              top: 5,
              right: 0,
              left: 0,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="Tickets"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorUv)"
            />

            <Tooltip />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
