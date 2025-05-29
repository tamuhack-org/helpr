import { GetServerSideProps } from 'next';

import { getServerSession, Session } from 'next-auth';
import { fetcher, Nullable } from '../../../lib/common';
import prisma from '../../../lib/prisma';
import authOptions from '../../api/auth/[...nextauth]';

import DashboardLayout from '../../../components/dashboard/DashboardLayout';

import { Button, ButtonGroup, Input, InputGroup } from '@chakra-ui/react';
import { User } from '@prisma/client';
import { useState, type ReactElement } from 'react';
import { MdCheck } from 'react-icons/md';
import useSWR from 'swr';
import MiniNumberDisplay from '../../../components/dashboard/users/MiniNumberDisplay';
import styles from '../../../styles/Home.module.css';
import type { NextPageWithLayout } from '../../_app';
import { UserWithRoles } from '@/components/common/types';

import useEventStore from '@/stores/useEventStore';

const Users: NextPageWithLayout = () => {
  const { data, error, isLoading } = useSWR('/api/users/all', fetcher, {});

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOnlyMentors, setShowOnlyMentors] = useState<boolean>(false);
  const [showOnlyAdmins, setShowOnlyAdmins] = useState<boolean>(false);

  const { activeEvent, setActiveEvent } = useEventStore((state) => state);

  const handleSearchQueryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setSearchQuery(value);
  };

  const handleRowClick = (email: string) => {
    window.location.href = `/dashboard/users/${email}`;
  };

  const searchFilter = (user: UserWithRoles) => {
    if (
      showOnlyMentors &&
      !user.roles.some(
        (role) => role.mentor && role.eventId === activeEvent?.id
      )
    )
      return false;
    if (showOnlyAdmins && !user.admin) return false;
    return (
      user.name.toLowerCase().includes(searchQuery) ||
      user.email.toLowerCase().includes(searchQuery)
    );
  };

  if (isLoading || error) {
    return <></>;
  }

  const numMentors = data.users.filter((user: UserWithRoles) =>
    user.roles.some((role) => role.mentor && role.eventId === activeEvent?.id)
  ).length;

  return (
    <div className="mx-auto w-5xl px-6 md:max-w-5xl mt-8">
      <p className="text-4xl font-bold">Users</p>
      <p className="text-gray-500 mt-1">View and manage your users.</p>
      <div className="flex flex-row gap-4 justify-start items-center mt-8 w-full">
        <MiniNumberDisplay role="Users" number={data.users.length} />
        <MiniNumberDisplay role="Mentors" number={numMentors} />
        <MiniNumberDisplay
          role="Admins"
          number={data.users.filter((user: User) => user.admin).length}
        />
      </div>
      <div className="mt-4 flex gap-2 lg:w-[500px]">
        <InputGroup>
          <Input
            placeholder="Search users"
            onChange={handleSearchQueryChange}
            value={searchQuery}
          />
        </InputGroup>
        <ButtonGroup spacing="2">
          <Button
            colorScheme="blue"
            variant={showOnlyMentors ? 'solid' : 'outline'}
            onClick={() => setShowOnlyMentors(!showOnlyMentors)}
          >
            Mentor
          </Button>
          <Button
            colorScheme="blue"
            variant={showOnlyAdmins ? 'solid' : 'outline'}
            onClick={() => setShowOnlyAdmins(!showOnlyAdmins)}
          >
            Admin
          </Button>
        </ButtonGroup>
      </div>
      <div className="mt-4">
        <div className="inline-block border-[1px] rounded-lg overflow-hidden">
          <div className="relative overflow-x-auto sm:rounded-lg">
            <table className="block text-sm text-left text-gray-500 dark:text-gray-500 max-h-[500px]">
              <thead className=" sticky top-0 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="w-auto py-3"></th>
                  <th scope="col" className=" py-3">
                    Name
                  </th>
                  <th scope="col" className=" px-6 py-3 max-lg:hidden">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Mentor?
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Admin?
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.users.filter((user: UserWithRoles) => searchFilter(user))
                  .length === 0 ? (
                  <tr className="dark:bg-gray-800 dark:border-gray-700 w-full">
                    <td className="px-6 py-4 text-center" />
                    <td className="px-6 py-4 text-center" colSpan={6}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  data.users
                    .filter((user: UserWithRoles) => searchFilter(user))
                    .map((user: UserWithRoles, index: number) => (
                      <tr
                        key={index}
                        className="dark:bg-gray-800 dark:border-gray-700 w-full cursor-pointer hover:bg-gray-100"
                        onClick={() => handleRowClick(user.email)}
                      >
                        <td className="px-6 py-4 text-center">{index + 1}</td>
                        <td
                          scope="row"
                          className={` py-4 overflow-scroll font-medium text-gray-900 whitespace-nowrap dark:text-white ${styles.hideScrollbar}`}
                        >
                          {user.name}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 max-lg:hidden">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {user.roles.some(
                            (role) =>
                              role.mentor && role.eventId === activeEvent?.id
                          ) && <MdCheck />}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {user.admin && <MdCheck />}
                        </td>
                        {/* <td className="px-6 py-4">
                        <a
                          href={`/dashboard/users/${user.email}`}
                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                        >
                          View
                        </a>
                      </td> */}
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

//Check if user is authenticated
//If not, redirect to login page
//Then check if user is admin
//If not, redirect to home page
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session: Nullable<Session> = await getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user?.email || '',
    },
  });

  if (!user?.admin) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

Users.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Users;
