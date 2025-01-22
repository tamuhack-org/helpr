import React from 'react';
import { fetcher } from '../../../lib/common';
import useSWR from 'swr';
import Link from 'next/link';

interface FrequencyItem {
  name: string;
  email: string;
  frequency: number;
}

export default function Leaderboard() {
  const { data, error, isLoading } = useSWR(
    '/api/analytics/leaderboard',
    fetcher,
    {}
  );

  if (isLoading || error) {
    return <p>Loading...</p>;
  }

  const frequency: { [key: string]: FrequencyItem } = data;

  const frequencyArray: FrequencyItem[] = Object.values(frequency);
  frequencyArray.sort((a, b) => b.frequency - a.frequency);

  console.log(frequencyArray);

  return (
    <div className="inline-block w-full md:w-auto border-[1px] rounded-lg overflow-hidden">
      <div className="relative overflow-x-auto sm:rounded-lg">
        <table className="block w-full text-sm text-left text-gray-500 dark:text-gray-500 max-h-[250px]">
          <thead className="sticky top-0 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3"></th>
              <th scope="col" className="pr-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Tickets
              </th>
              <th scope="col" className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {frequencyArray.map((key, index) => (
              <tr
                key={key.email}
                className="dark:bg-gray-800 dark:border-gray-700"
              >
                <td className="px-6 py-4 text-center">{index + 1}</td>
                <th
                  scope="row"
                  className="pr-6 py-4 min-w-[200px] max-w-[200px] overflow-scroll font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {key.name}{' '}
                </th>
                <td className="px-6 py-4 font-medium text-gray-900 text-center">
                  {key.frequency}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/users/${key.email}`}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
