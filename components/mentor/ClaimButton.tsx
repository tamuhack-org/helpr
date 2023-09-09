import React from 'react';
import { useToast } from '@chakra-ui/react';
import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { Ticket } from '@prisma/client';
import { fetcher } from '../../lib/common';
import axios from 'axios';

export default function ClaimButton(props: { ticket: Ticket }) {
  const { data, isLoading } = useSWR('/api/users/me', fetcher, {});

  console.log(data);
  const [claimLoading, setClaimLoading] = useState(false);
  const [unclaimLoading, setUnclaimLoading] = useState(false);
  const toast = useToast();

  async function ticketAction(action: string) {
    // setLoading(true);
    if (claimLoading || unclaimLoading) {
      return;
    }

    if (action == 'claim') {
      setClaimLoading(true);
    } else {
      setUnclaimLoading(true);
    }

    await axios({
      method: 'post',
      url: `/api/tickets/${action}`,
      data: {
        ticketId: props.ticket.id,
      },
    })
      .then(async function () {
        await mutate('/api/tickets/all');
      })
      .catch(function (error) {
        console.log(error);
        toast({
          title: 'Error',
          status: 'error',
          position: 'bottom-right',
          duration: 3000,
          isClosable: true,
        });
      });
    setClaimLoading(false);
    setUnclaimLoading(false);
  }

  if (isLoading) {
    return <p>Loading</p>;
  }

  if (claimLoading || unclaimLoading) {
    return (
      <div className="flex justify-center mt-6">
        <a className="w-full text-center py-2 bg-gray-400 border-2 border-gray-400 rounded-lg text-md font-bold text-white">
          Loading
        </a>
      </div>
    );
  }

  if (props.ticket.resolvedTime) {
    return (
      <div className="flex justify-center mt-6">
        <a className="w-full text-center py-2 bg-gray-400 rounded-lg text-md font-bold text-white">
          Resolved
        </a>
      </div>
    );
  }

  if (
    !unclaimLoading &&
    (claimLoading ||
      (props.ticket.claimantId && props.ticket.claimantId == data?.user.id))
  ) {
    return (
      <div className="flex justify-between items-center mt-6">
        {/* {loading && <Loading />} */}
        <a
          className={`${
            claimLoading
              ? 'bg-gray-400 border-gray-400'
              : 'bg-blue-500 border-blue-500'
          } w-7/12 text-center py-2  border-2 rounded-lg text-md font-bold text-white cursor-pointer`}
          onClick={() => ticketAction('resolve')}
        >
          Resolve
        </a>
        <a
          className={`${
            claimLoading
              ? 'text-gray-400 border-gray-400'
              : 'border-red-400 text-red-400'
          } w-1/3 text-center py-2 border-2  rounded-lg text-md font-bold  cursor-pointer`}
          onClick={() => ticketAction('unclaim')}
        >
          Unclaim
        </a>
      </div>
    );
  }

  if (props.ticket.claimantId && !unclaimLoading) {
    return (
      <div className="flex justify-center mt-6">
        <a className="w-full text-center py-2 bg-gray-400 rounded-lg text-md font-bold text-white">
          Claimed by {props.ticket.claimantName}
        </a>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-6 cursor-pointer">
      <p
        className={`${
          unclaimLoading
            ? 'bg-gray-400 border-gray-400'
            : 'bg-blue-500 border-blue-500'
        } w-full text-center py-2 border-2 rounded-lg text-md font-bold text-white`}
        onClick={() => ticketAction('claim')}
      >
        Claim Ticket
      </p>
    </div>
  );
}
