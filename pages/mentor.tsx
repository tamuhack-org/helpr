import { Select } from '@chakra-ui/react';
import React, { ReactElement, useState } from 'react';
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
      {/* <TicketStream filter={filter || 'active'} /> */}
    </>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout page="mentor">{page}</MainLayout>;
};

export default Home;
