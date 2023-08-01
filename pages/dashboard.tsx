import { GetServerSideProps } from 'next';

import { Session, getServerSession } from 'next-auth';
import authOptions from './api/auth/[...nextauth]';
import { Nullable } from '../lib/common';

import prisma from '../lib/prisma';

import Banner from '../components/common/Banner';

export default function Home() {
  return (
    <div className="h-full py-10">
      <Banner />
      <p className="p-4 text-xl">Dashboard</p>
    </div>
  );
}

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
