import { Select } from '@chakra-ui/react';
import Link from 'next/link';
import React, { ReactElement, useState } from 'react';
import { FaDiscord } from 'react-icons/fa';
import { MainLayout } from '../components/common/MainLayout';
import { TicketStream } from '../components/tickets/TicketStream';

const Home = () => {
  const [filter, setFilter] = useState('');

  const handleDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;
    setFilter(value);
  };

  return (
    <>
      <div className="mt-8">
        <Select
          onChange={handleDropdownChange}
          bg="white"
          className="flex flex-col "
        >
          <option defaultValue="active" value="active">
            Active Tickets
          </option>
          <option value="all">All Tickets</option>
          <option value="claimedunresolved">Claimed Tickets</option>
          <option value="resolved">Resolved Tickets</option>
          <option value="mine">My Tickets</option>
        </Select>
      </div>
      <TicketStream filter={filter || 'active'} />
      <Link
        href="/link/discord"
        aria-label="Link Discord"
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600"
      >
        <FaDiscord size={24} />
      </Link>
    </>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout page="mentor">{page}</MainLayout>;
};

export default Home;
