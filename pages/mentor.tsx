import Head from 'next/head';
import { GetServerSideProps } from 'next';

import { fetcher } from '../lib/common';
import useSWR from 'swr';

import Banner from '../components/common/Banner';
import Navbar from '../components/common/Navbar';
import ClaimButton from '../components/mentor/ClaimButton';
import { Select } from '@chakra-ui/react';

import { Session, unstable_getServerSession } from 'next-auth';
import authOptions from './api/auth/[...nextauth]';
import { Nullable } from '../lib/common';

import prisma from '../lib/prisma';
import { Ticket } from '@prisma/client';

export default function Home() {
  const { data, error, isLoading } = useSWR('/api/tickets/all', fetcher, {});

  if (isLoading) {
    return 'Loading';
  }

  if (error) {
    return 'Error';
  }

  const ticketList: JSX.Element[] = [];
  data.tickets.map((ticket: Ticket, index: number) => {
    ticketList.push(
      <div
        key={index}
        className="relative block p-4 sm:p-8 bg-white border border-gray-100 shadow-md rounded-xl my-8 w-[90vw] md:w-[50vw] lg:w-[40vw]"
      >
        <span className="absolute right-4 top-4 rounded-full px-3 py-1.5 bg-green-100 text-green-600 font-medium text-xs">
          hi
        </span>

        <div className=" text-gray-500 sm:pr-8">
          <h5 className="w-3/4 text-xl font-bold text-gray-900">
            {ticket.issue}
          </h5>

          <p className="mt-2 text-sm">
            {ticket.contact} (Contact: {ticket.contact})
          </p>

          <p className="mt-2 text-sm">Located at: {ticket.location}</p>
        </div>

        <ClaimButton ticket={ticket} />
      </div>
    );
  });

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
      <div className="w-screen overflow-y-hidden">
        <Banner />
        <div className="flex justify-center overflow-y-auto h-full w-screen m-auto md:w-3/4">
          <div className="mt-8">
            <Navbar user={data.user} page="mentor" />
            <div className="mt-8">
              <Select bg="white">
                <option defaultValue="unresolved" value="unresolved">
                  Active Tickets
                </option>
                <option value="all">All Tickets</option>
                <option value="claimedunresolved">Claimed Tickets</option>
                <option value="resolved">Resolved Tickets</option>
              </Select>
            </div>
            {ticketList}

            {/* <TTicketStream ticketData={tickets} user={user}></TTicketStream> */}
          </div>
        </div>
      </div>
    </>
  );
}

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

  const user = await prisma.user.findUnique({
    where: {
      email: session.user?.email || '',
    },
  });

  if (!user?.mentor || !user?.admin) {
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
