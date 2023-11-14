import React from 'react';
import { fetcher } from '../../../lib/common';
import useSWR from 'swr';

export default function Topics({ email }: { email?: string | undefined }) {
  const { data, error, isLoading } = useSWR(
    email ? `/api/analytics/tickets/mentortopics?email=${email}` : '/api/analytics/tickets/topics',
    fetcher,
    {}
  );

  if (isLoading || error) {
    return <p>Loading...</p>;
  }

  const topics = Object.keys(data).map(function (key) {
    return [key.charAt(0).toUpperCase() + key.slice(1), data[key]];
  });

  topics.sort(function (first, second) {
    return second[1] - first[1];
  });

  return (
    <div className="flex gap-2 flex-wrap lg:w-[500px] max-h-[200px] overflow-y-scroll">
      {topics.filter((topic) => topic[1] > 1).map((topic) => (
        <div
          key={topic[0]}
          className="flex gap-1 border-2 rounded-md p-1 bg-gray-200"
        >
          <p className="font-semibold">{topic[0]}</p>
          <p>{topic[1]}</p>
        </div>
      ))}
    </div>
  );
}
