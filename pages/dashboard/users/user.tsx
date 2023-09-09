import React, { ReactElement, useEffect, useState } from 'react';
import useSWR from 'swr';
import Loading from '../../../components/common/Loading';
import { Nullable, fetcher } from '../../../lib/common';
import { useRouter } from 'next/router';
import { User } from '@prisma/client';
import { NextPageWithLayout } from '../../_app';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { GetServerSideProps } from 'next';
import { Session, getServerSession } from 'next-auth';
import prisma from '../../../lib/prisma';
import authOptions from '../../api/auth/[...nextauth]';
import Image from 'next/image';
import { Tag } from '@chakra-ui/react';

const UserInfo: NextPageWithLayout = () => {
  const [user, setUser] = useState<User | null>();

  const router = useRouter();
  const { data, error, isLoading } = useSWR(`/api/users/lookup?email=${router.query.email}`, fetcher, {});

  useEffect(() => {
    if (data) setUser(data.user);
  }, [data]);

  if (isLoading || error) {
    return <></>;
  }

  return (
    <div className="flex flex-col w-full items-start mt-4">
      <div className="flex flex-row w-full gap-6">
        {user?.image ? (
          <Image
            src={user.image}
            alt="user-image"
            className="rounded-full"
            width={120}
            height={120}
            sizes="(max-width: 768px) 25px, (max-width: 1200px) 36px, 50px"
          />
        ) : (
          <div className="w-32 rounded-full bg-gray-400" />
        )}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold -mb-3">{user?.name}</h1>
          <p>{user?.email}</p>
          <div className="flex flex-row gap-2">
            {user?.admin && <Tag>Admin</Tag>}
            {user?.mentor && <Tag>Mentor</Tag>}
          </div>
        </div>
      </div>

    </div>
  )
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

UserInfo.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default UserInfo;