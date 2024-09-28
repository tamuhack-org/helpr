import React from 'react';
import { useToast } from '@chakra-ui/react';
import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { Ticket } from '@prisma/client';
import { fetcher } from '../../lib/common';
import axios from 'axios';

export const ClaimButton = ({ ticket }: { ticket: Ticket }) => {
  const { data, isLoading } = useSWR('/api/users/me', fetcher, {});
  const [claimLoading, setClaimLoading] = useState(false);
  const [unclaimLoading, setUnclaimLoading] = useState(false);
  const toast = useToast();

  const ticketAction = async (action: string) => {
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
        ticketId: ticket.id,
      },
    })
      .then(async function () {
        await mutate('/api/tickets/all');
        await mutate('/api/tickets/active');
      })
      .catch(function (error) {
        console.log(error);
        toast({
          title: 'Error',
          status: 'error',
        });
      });
    setClaimLoading(false);
    setUnclaimLoading(false);
  };

  if (isLoading || claimLoading || unclaimLoading) {
    return (
      <div className="flex justify-center mt-6">
        <a className="w-full text-center py-2 bg-gray-400 border-2 border-gray-400 rounded-lg text-md font-bold text-white">
          Loading
        </a>
      </div>
    );
  }

  if (ticket.resolvedTime) {
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
    (claimLoading || (ticket.claimantId && ticket.claimantId === data?.user.id))
  ) {
    return (
      <div className="flex justify-between items-center mt-6">
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

  if (ticket.claimantId && !unclaimLoading) {
    return (
      <div className="flex justify-center mt-6">
        <a className="w-full text-center py-2 bg-gray-400 rounded-lg text-md font-bold text-white">
          Claimed by {ticket.claimantName}
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
};
