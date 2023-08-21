import Head from 'next/head';
import React, { useState } from 'react';

import Banner from '../components/common/Banner';
import Navbar from '../components/common/Navbar';
import { Select } from '@chakra-ui/react';

import TicketStream from '../components/tickets/TicketStream';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function Home() {
  const [filter, setFilter] = useState('');
  const session = useSession();
  const router = useRouter();

  if (!session) {
    router.push('/login');
    return;
  }

  if (
    session.data?.user &&
    (!session.data?.user.mentor || !session.data?.user.admin)
  ) {
    router.push('/');
  }

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
