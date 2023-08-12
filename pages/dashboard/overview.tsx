import { GetServerSideProps } from 'next';

import { Session, getServerSession } from 'next-auth';
import authOptions from '../api/auth/[...nextauth]';
import { Nullable } from '../../lib/common';
import prisma from '../../lib/prisma';

import DashboardLayout from '../../components/dashboard/DashboardLayout';

import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../_app';
import MiniIncomingTickets from '../../components/dashboard/overview/MiniIncomingTickets';
import Leaderboard from '../../components/dashboard/overview/Leaderboard';

const Overview: NextPageWithLayout = () => {
  return (
    <div className="mt-4">
      <p className="text-4xl font-bold">Overview</p>
      <p className="text-gray-500 mt-1">
        Get a quick glimpse of how your mentors are doing.
      </p>
      <div className="flex overflow-y-scroll mt-8 gap-2">
        <MiniIncomingTickets />
      </div>
      <div className="mt-8">
        <p className="text-3xl font-bold mb-4">Leaderboard</p>
        <Leaderboard />
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

Overview.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Overview;
