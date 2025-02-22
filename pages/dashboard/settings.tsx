import { GetServerSideProps } from 'next';
import { getServerSession, Session } from 'next-auth';
import { type ReactElement } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Nullable } from '../../lib/common';
import prisma from '../../lib/prisma';
import authOptions from '../api/auth/[...nextauth]';
import useEventStore from '@/stores/useEventStore';
import GeneralEventSettingsBlock from '@/components/settings/GeneralEventSettingsBlock';
import DangerEventSettingsBlock from '@/components/settings/DangerEventSettingsBlock';

const Settings = () => {
  const { activeEvent } = useEventStore((state) => state);
  if (!activeEvent) {
    return <p>Loading</p>;
  }

  return (
    <div className="mx-auto w-5xl px-6 md:max-w-5xl mt-8">
      <p className="font-semibold text-3xl">Event Settings</p>
      <GeneralEventSettingsBlock />
      <DangerEventSettingsBlock />
    </div>
  );
};

//TODO: Abstract auth in middleware
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
