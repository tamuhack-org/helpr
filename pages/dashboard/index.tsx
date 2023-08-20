import { GetServerSideProps } from 'next';

import { Session, getServerSession } from 'next-auth';
import authOptions from '../api/auth/[...nextauth]';
import { Nullable } from '../../lib/common';
import prisma from '../../lib/prisma';

import DashboardLayout from '../../components/dashboard/DashboardLayout';

import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../_app';
import { useRouter } from 'next/router';

const Overview: NextPageWithLayout = () => {
  const router = useRouter();

  router.replace('/dashboard/overview');

  return <div className="mt-4"></div>;
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
