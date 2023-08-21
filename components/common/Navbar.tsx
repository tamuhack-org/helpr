import React from 'react';
import Link from 'next/link';

import {
  IoHomeOutline,
  IoMailOutline,
  IoPeopleOutline,
  IoLogOutOutline,
} from 'react-icons/io5';
import { signOut } from 'next-auth/react';

import { useSession } from 'next-auth/react';

export type NavProps = {
  page: string;
};

export default function Navbar(props: NavProps) {
  const session = useSession();

  if (!session.data?.user || !props.page) {
    return (
      <div className="flex justify-between w-full">
        <div className="flex"></div>
        <div
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="p-8 border h-12 w-12 bg-white border-gray-100 rounded-xl shadow-md"
        >
          <IoLogOutOutline className="scale-[1.75] -translate-y-2/4 -translate-x-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between w-full my-4">
      <div className="flex">
        <Link href="/">
          <div
            className={`${
              props.page == 'home' ? '' : 'shadow-md'
            } p-8 mr-4 border h-12 w-12 bg-white border-gray-100 rounded-xl`}
          >
            <IoHomeOutline className="scale-[1.75] -translate-y-2/4 -translate-x-1/2" />
          </div>
        </Link>
        {(session.data.user.mentor || session.data.user.admin) && (
          <Link href="/mentor">
            <div
              className={`${
                props.page == 'mentor' ? '' : 'shadow-md'
              } p-8 mr-4 border h-12 w-12 bg-white border-gray-100 rounded-xl`}
            >
              <IoMailOutline className="scale-[1.75] -translate-y-2/4 -translate-x-1/2" />
            </div>
          </Link>
        )}
        {session.data.user.admin && (
          <Link href="/admin">
            <div
              className={`${
                props.page == 'admin' ? '' : 'shadow-md'
              } p-8 mr-4 border h-12 w-12 bg-white border-gray-100 rounded-xl`}
            >
              <IoPeopleOutline className="scale-[1.75] -translate-y-2/4 -translate-x-1/2" />
            </div>
          </Link>
        )}
      </div>
      <div
        onClick={() => signOut({ callbackUrl: '/' })}
        className="p-8 border h-12 w-12 bg-white border-gray-100 rounded-xl shadow-md"
      >
        <IoLogOutOutline className="scale-[1.75] -translate-y-2/4 -translate-x-1/3" />
      </div>
    </div>
  );
}
