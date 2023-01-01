import React from 'react';
import axios from 'axios';
import { Input } from '@chakra-ui/react';
import InfoModal from './InfoModal';
import { useToast } from '@chakra-ui/react';
import { useSWRConfig } from 'swr';

export default function Submit() {
  const toast = useToast();
  const { mutate } = useSWRConfig();

  async function submitTicket() {
    const issue = document.getElementById('issue') as HTMLInputElement;
    const location = document.getElementById('location') as HTMLInputElement;
    const contact = document.getElementById('contact') as HTMLInputElement;

    const issueValue = issue.value;
    const locationValue = location.value;
    const contactValue = contact.value;

    await axios({
      method: 'post',
      url: '/api/tickets/create',
      data: {
        issue: issueValue,
        location: locationValue,
        contact: contactValue,
      },
    })
      .then(async function () {
        await mutate('/api/users/me');
        toast({
          title: 'Ticket Submitted',
          description: 'Please wait for a mentor to arrive',
          status: 'success',
          position: 'bottom-right',
          duration: 3000,
          isClosable: true,
        });
      })
      .catch(function (error: Error) {
        toast({
          title: 'Error',
          description: 'Unable to submit ticket',
          status: 'error',
          position: 'bottom-right',
          duration: 3000,
          isClosable: true,
        });
        console.log('Request Failed', error.message);
      });
  }

  return (
    <div className="p-8 mx-4 bg-white border border-gray-100 shadow-md rounded-xl">
      <div className="flex justify-between items-center">
        <p className="font-bold text-3xl text-gray-700">Submit ticket</p>
        <InfoModal />
      </div>
      <p className="mt-3 text-md text-gray-600">Issue</p>
      <Input
        id="issue"
        className="mt-2"
        variant="outline"
        placeholder="Issue"
      />
      <p className="mt-3 text-md text-gray-600">
        Location (so we can find you!)
      </p>
      <Input
        id="location"
        className="mt-2"
        variant="outline"
        placeholder="Location"
      />
      <p className="mt-3 text-md text-gray-600">
        Contact (if we can&apos;t find you!)
      </p>
      <Input
        id="contact"
        className="mt-2"
        variant="outline"
        placeholder="Contact"
      />
      <button
        onClick={() => submitTicket()}
        className="w-full mt-8 py-4 px-8 text-white font-bold bg-blue-500 rounded-xl"
      >
        Submit Ticket
      </button>
    </div>
  );
}
