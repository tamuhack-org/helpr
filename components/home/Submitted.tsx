import React from 'react';
import axios from 'axios';

import { useToast } from '@chakra-ui/react';
import useSWR, { useSWRConfig } from 'swr';
import { fetcher } from '../../lib/common';

export default function Submitted(props: { ticketId: string }) {
  const toast = useToast();
  const {} = useSWR('/api/users/me', fetcher, {
    refreshInterval: 5000,
  });

  const { mutate } = useSWRConfig();

  async function cancelTicket() {
    await axios({
      method: 'post',
      url: '/api/tickets/cancel',
      data: {
        ticketId: props.ticketId,
      },
    })
      .then(async function (response) {
        console.log(response);
        await mutate('/api/users/me');
      })
      .catch(function (error: Error) {
        toast({
          title: 'Error',
          description: 'Unable to cancel ticket',
          status: 'error',
          position: 'bottom-right',
          duration: 3000,
          isClosable: true,
        });
        console.log('Request Failed', error.message);
      });
  }

  return (
    <div className="p-8 mx-4 bg-white border border-gray-100 shadow-md rounded-xl ">
      <p className="font-bold text-3xl text-gray-700">Ticket Submitted</p>
      <p className="mt-3 text-md text-gray-600 w-3/4">
        Your ticket is currently in the queue. A mentor will arrive shortly!
      </p>
      <button
        onClick={() => cancelTicket()}
        className="w-full mt-8 py-4 px-8 text-white font-bold bg-red-500 rounded-xl"
      >
        Cancel Ticket
      </button>
    </div>
  );
}
