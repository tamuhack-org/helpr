import { GetServerSideProps } from 'next';

import { Session, getServerSession } from 'next-auth';
import authOptions from './api/auth/[...nextauth]';
import { Nullable } from '../lib/common';

import prisma from '../lib/prisma';
import { fetcher } from '../lib/common';
import useSWR from 'swr';

import { useState } from 'react';
import { Select } from '@chakra-ui/react';
import Navbar from '../components/common/Navbar';
import Banner from '../components/common/Banner';
import AdminTable from '../components/admin/AdminTable';
import Loading from '../components/common/Loading';
// import LeaderTable from '../components/leaderboard/LeaderTable';

/*
ADMIN VIEW:
'userTable' - Shows all users and allows role changing
'leaderboard' - Shows leaderboard of all mentors
*/

export default function Home() {
  const { data, error, isLoading } = useSWR('/api/users/all', fetcher, {});
  const [adminView, setAdminView] = useState('userTable');

  if (isLoading || error) {
    return <Loading />;
  }

  function handleDropdownChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setAdminView(event.target.value);
  }

  return (
    <div className="h-full py-10">
      <Banner />
      <div className="flex justify-center mx-4 mt-8 md:mt-24">
        <div className="w-screen sm:w-auto">
          <div className="flex justify-center mb-6 2xl:w-[500px]">
            <Navbar page="admin" />
          </div>
          <div className="mt-8">
            <Select onChange={handleDropdownChange} bg="white">
              <option defaultValue="userTable" value="userTable">
                Users
              </option>
              {/* <option value="leaderboard">Leaderboard</option> */}
            </Select>
          </div>
          {adminView == 'userTable' && <AdminTable users={data.users} />}
          {/* <LeaderTable view={adminView} /> */}
        </div>
      </div>
    </div>
  );
}

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
