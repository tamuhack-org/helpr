import { Button, ButtonGroup, Input, InputGroup } from '@chakra-ui/react';
import { User } from '@prisma/client';
import { GetServerSideProps } from 'next';
import { getServerSession, Session } from 'next-auth';
import { useState, type ReactElement } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { fetcher, Nullable } from '../../lib/common';
import prisma from '../../lib/prisma';
import authOptions from '../api/auth/[...nextauth]';
import type { NextPageWithLayout } from '../_app';

const Settings: NextPageWithLayout = () => {
  return (
    <div className="mt-4">
      <p className="text-4xl font-bold">Admin Settings</p>
      <p className="text-gray-500 mt-1">
        Change how HelpR works for your event.
      </p>

      <div className="mt-8">
        <p className="text-2xl font-bold">Event Settings</p>
      </div>
    </div>
  );
};

//TODO: Abstract auth in middleware
//
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

Settings.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Settings;
