import React from 'react';
import { fetcher } from '../../../lib/common';
import useSWR from 'swr';

export default function Leaderboard() {
  const { data, error, isLoading } = useSWR(
    '/api/analytics/leaderboard',
    fetcher,
    {}
  );

  if (isLoading || error) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div>
        {Object.keys(data).map((key) => (
          <p key={key}>
            {key}: {data[key]}
          </p>
        ))}
      </div>
    </div>
  );
}
