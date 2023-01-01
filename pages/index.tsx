import Head from 'next/head';
import { GetServerSideProps } from 'next';

import axios from 'axios';
import useSWR from 'swr';

import Banner from '../components/common/Banner';
import Navbar from '../components/common/Navbar';
import Submitted from '../components/home/Submitted';
import Submit from '../components/home/Submit';

import { Session, unstable_getServerSession } from 'next-auth';
import authOptions from './api/auth/[...nextauth]';
import { Nullable } from '../lib/common';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session: Nullable<Session> = await unstable_getServerSession(
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

  return {
    props: {},
  };
};

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function Home() {
  const { data, error, isLoading } = useSWR('/api/users/me', fetcher, {});

  if (isLoading) {
    return 'Loading';
  }

  if (error) {
    return 'Error';
  }

  return (
    <>
      <Head>
        <title>HelpR</title>
        <meta
          name="description"
          content="Online Mentorship Queue For Hackathon Participants"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="h-full py-10">
        <Banner />
        <div className="flex justify-center items-center mt-8 md:mt-24">
          <div>
            <div className="flex justify-between mx-4 mb-6">
              <Navbar user={data.user} page="home" />
            </div>
            {data.user.ticketId ? (
              <Submitted ticketId={data.user.ticketId} />
            ) : (
              <Submit />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
