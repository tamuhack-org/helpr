import React from 'react';
import axios from 'axios';
import { useToast } from '@chakra-ui/react';
import useSWR from 'swr';
import { Ticket } from '@prisma/client';
import { fetchData } from 'next-auth/client/_utils';

export default function ClaimButton(props: { ticket: Ticket }) {
  const { data } = useSWR('/api/users/me', fetchData, {});
  const toast = useToast();

  function ticketAction(action: string) {
    return action;
  }

  if (props.ticket.claimantId && props.ticket.claimantId == data.user.id) {
    return (
      <div className="flex justify-between items-center mt-6">
        <a
          className="w-7/12 text-center py-2 bg-blue-500 border-2 border-blue-500 rounded-lg text-md font-bold text-white cursor-pointer"
          onClick={() => ticketAction('resolve')}
        >
          Resolve
        </a>
        <a
          className="w-1/3 text-center py-2 border-2 border-red-400 rounded-lg text-md font-bold text-red-400 cursor-pointer"
          onClick={() => ticketAction('unclaim')}
        >
          Unclaim
        </a>
      </div>
    );
  }

  if (props.ticket.claimantId) {
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
        className="w-full text-center py-2 bg-blue-500 border-2 border-blue-500 rounded-lg text-md font-bold text-white"
        onClick={() => ticketAction('claim')}
      >
        Claim Ticket
      </p>
    </div>
  );
}
