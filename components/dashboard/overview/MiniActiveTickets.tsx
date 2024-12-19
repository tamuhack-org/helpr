import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { fetcher } from '../../../lib/common';
import useSWR from 'swr';
import { ResolvedTicket } from '@prisma/client';

function createDataPoints(data: [ResolvedTicket]) {
  const times = data.map((ticket) => new Date(ticket.publishTime));

  const currentTime = new Date();

  const sixHoursAgo = new Date(currentTime.getTime() - 6 * 60 * 60 * 1000);

  const timesWithinLastSixHours = times.filter((time) => time >= sixHoursAgo);

  const timesPerHour: { [hour: number]: number } = {};

  timesWithinLastSixHours.forEach((time) => {
    const hour = time.getHours();
    timesPerHour[hour - sixHoursAgo.getHours() - 1] =
      (timesPerHour[hour] || 0) + 1;
  });

  // Generate the final result in the desired format, substituting 0 for missing hours
  const datapoints = Array.from({ length: 6 }, (_, hour) => ({
    Tickets: timesPerHour[hour] || 0,
  }));

  return datapoints;
}

export default function MiniIncomingTickets() {
  const { data, error, isLoading } = useSWR(
    '/api/analytics/tickets/incoming',
    fetcher,
    {}
  );

  if (isLoading || error) {
    return <p>Loading...</p>;
  }

  const points = createDataPoints(data.tickets);

  return (
    <div className="flex shrink-0 gap-4 border-[1px] border-gray-200 rounded-lg text-sm p-4">
      <div>
        <p>Incoming</p>
        <p className="mt-8 font-bold text-lg">{data.tickets.length}</p>
        <p>Published Tickets</p>
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
