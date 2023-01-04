import React from 'react';
import axios from 'axios';
import { Input } from '@chakra-ui/react';
import InfoModal from './InfoModal';
import { useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { Ticket, User } from '@prisma/client';

export default function Submit(props: { user: User; ticket: Ticket }) {
  const toast = useToast();
  const { mutate } = useSWRConfig();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitted, setSubmitted] = useState(props.ticket != null);

  async function submitTicket() {
    const issue = document.getElementById('issue') as HTMLInputElement;
    const location = document.getElementById('location') as HTMLInputElement;
    const contact = document.getElementById('contact') as HTMLInputElement;

    const issueValue = issue.value;
    const locationValue = location.value;
    const contactValue = contact.value;

    if (!issueValue || !locationValue || !contactValue) {
      //TODO: Write a wrapper for this toast stuff because this is irritating me.
      toast({
        title: 'Error',
        description: 'Please fill out all forms',
        status: 'error',
        position: 'bottom-right',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setSubmitted(true);
    setSubmitLoading(true);
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
        setSubmitLoading(false);
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
        setSubmitted(false);
        setSubmitLoading(false);
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

  async function cancelTicket() {
    if (submitLoading) {
      return;
    }
    await axios({
      method: 'post',
      url: '/api/tickets/cancel',
      data: {
        ticketId: props.ticket.id,
      },
    })
      .then(async function (response) {
        console.log(response);
        setSubmitted(false);
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

  if (submitted) {
    return (
      <div className="p-8 bg-white border border-gray-100 shadow-md rounded-xl md:w-[500px]">
        <p className="font-bold text-3xl text-gray-700">
          {submitLoading ? 'Submitting Ticket' : 'Ticket Submitted'}
        </p>
        <p className="mt-3 text-md text-gray-600">
          {submitLoading
            ? 'Your ticket is currently being submitted to our queue.'
            : 'Your ticket is currently in the queue. A mentor will arrive shortly!'}
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

  return (
    <div className="p-8 bg-white border border-gray-100 shadow-md rounded-xl md:w-[500px]">
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
