import React from 'react';
import { User } from '@prisma/client';
import AdminStatus from './AdminStatus';

export default function AdminTable(props: { users: User[] }) {
  if (!props.users) {
    return (
      <div className="flex justify-center p-8 bg-white border border-gray-100 shadow-md rounded-xl my-8 w-[90vw] lg:w-[40vw]">
        <p className="text-xl font-bold">No Users!</p>
      </div>
    );
  }

  const userRows: JSX.Element[] = [];

  const users = props.users;
  users.sort((a, b) => (a.email ?? "" > b.email ?? "" ? 1 : -1));

  users.forEach((user) => {
    userRows.push(
      <div className="sm:flex items-center justify-between py-2 text-center border-b-2">
        <p className="sm:w-1/2 sm:mb-0 mb-2 text-left flex-shrink-0 text-sm sm:text-lg">
          {user.email}
        </p>
        <AdminStatus user={user} />
      </div>
    );
  });

  return (
    <div className="relative block p-4 sm:p-8 bg-white border border-gray-100 shadow-md rounded-xl my-8 w-[90vw] md:w-[75vw] lg:w-[45vw] 2xl:w-[45vw]">
      {userRows}
    </div>
  );
}
