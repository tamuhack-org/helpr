import React from 'react';
import { useState } from 'react';
import { fetcher } from '../../lib/common';
import useSWR from 'swr';
import { User } from '@prisma/client';
import { AdminStatus } from './AdminStatus';
import { Input } from '@chakra-ui/react';
import Fuse from 'fuse.js';
import { TextCard } from '../common/TextCard';

export const AdminTable = () => {
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const { data, error, isLoading } = useSWR('/api/users/all', fetcher, {});

  if (isLoading || error) {
    return <TextCard text="Loading..." />;
  }

  if (!data.users) {
    return <TextCard text="No Users!" />;
  }

  const options = {
    includeMatches: true,
    threshold: 0.2,
    keys: ['name', 'email'],
  };

  const fuse = new Fuse(data.users, options);

  //if this ever becomes too expensive to run onChange (it probably wont), then use a debouncer
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    // If the user searched for an empty string,
    // display all data.
    if (value.length === 0) {
      setSearchResults(data.users);
      return;
    }

    const results: FuseResult<User>[] = fuse.search(value);
    console.log(results);

    const items: User[] = results.map((result) => result.item);
    setSearchResults(items);
  };

  const results = searchResults.length > 0 ? searchResults : data.users;

  return (
    <>
      <Input
        placeholder="Search users"
        className="mt-4 mb-2"
        onChange={(e) => handleSearch(e)}
      ></Input>
      <div className="relative block px-4 sm:p-8 bg-white border border-gray-100 shadow-md rounded-xl h-[55vh] overflow-scroll">
        {results.map((user: User) => (
          <div
            key={user.id}
            className="sm:flex items-center justify-between py-2 text-center border-b-2 "
          >
            <p className="sm:w-1/2 sm:mb-0 mb-2 text-left flex-shrink-0 text-sm sm:text-lg">
              {user.email}
            </p>
            <AdminStatus user={user} />
          </div>
        ))}
      </div>
    </>
  );
};

interface FuseResult<T> {
  item: T;
}
