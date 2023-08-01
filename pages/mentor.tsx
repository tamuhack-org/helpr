import Head from 'next/head';
import { GetServerSideProps } from 'next';
import React, { useState } from 'react';

import Banner from '../components/common/Banner';
import Navbar from '../components/common/Navbar';
import { Select } from '@chakra-ui/react';

import { Session, getServerSession } from 'next-auth';
import authOptions from './api/auth/[...nextauth]';
import { Nullable } from '../lib/common';

import prisma from '../lib/prisma';
import TicketStream from '../components/tickets/TicketStream';

export default function Home() {
  const [filter, setFilter] = useState('');

  const handleDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;
    setFilter(value);
  };

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
        <div className="flex justify-center mt-8 mx-4 md:mt-24">
          <div className="w-[90vw] lg:w-[35vw] 2xl:w-[500px]">
            <div className="flex justify-center mb-6 ">
              <Navbar page="mentor" />
            </div>
            <div className="mt-8 w-[90vw] lg:w-[35vw] 2xl:w-[500px]">
              <Select onChange={handleDropdownChange} bg="white">
                <option defaultValue="unresolved" value="unresolved">
                  Active Tickets
                </option>
                <option value="all">All Tickets</option>
                <option value="claimedunresolved">Claimed Tickets</option>
                <option value="resolved">Resolved Tickets</option>
              </Select>
            </div>
            <TicketStream filter={filter} />
          </div>
        </div>
      </div>
    </>
  );
}

//Check if user is authenticated
//If not, redirect to login page
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

  if (!user?.mentor && !user?.admin) {
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
