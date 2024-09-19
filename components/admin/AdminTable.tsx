import React from 'react';
import { fetcher } from '../../lib/common';
import useSWR from 'swr';
import { User } from '@prisma/client';
import AdminStatus from './AdminStatus';

export default function AdminTable() {
  const { data, error, isLoading } = useSWR('/api/users/all', fetcher, {});

  if (isLoading || error) {
    return <p>Loading...</p>;
  }
  if (!data.users) {
    return (
      <div className="flex justify-center p-8 bg-white border border-gray-100 shadow-md rounded-xl my-8 w-[90vw] lg:w-[40vw]">
        <p className="text-xl font-bold">No Users!</p>
      </div>
    );
  }

  return (
    <div className="relative block p-4 sm:p-8 bg-white border border-gray-100 shadow-md rounded-xl mt-8 h-[55vh] overflow-scroll">
      {data.users.map((user: User) => (
        <div
          key={user.id}
          className="sm:flex items-center justify-between py-2 text-center border-b-2 "
        >
          <p className="sm:w-1/2 sm:mb-0 mb-2 text-left flex-shrink-0 text-sm sm:text-lg">
            {user.email}
          </p>
          <AdminStatus user={user} />
        </div>
      ))}
    </div>
  );
}
