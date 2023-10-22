import React from 'react';
import axios from 'axios';
import { Input } from '@chakra-ui/react';
import InfoModal from './InfoModal';
import useSWR from 'swr';
import { fetcher } from '../../lib/common';
import { useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useSWRConfig } from 'swr';

export default function Submit() {
  const toast = useToast();

  const { data, error, isLoading } = useSWR('/api/users/me', fetcher, {
    refreshInterval: 1000,
  });

  const { mutate } = useSWRConfig();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [issue, setIssue] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');

  if (isLoading || error) {
    return <p>Loading</p>;
  }

  async function submitTicket() {
    if (submitLoading) {
      return;
    }

    try {
      setSubmitLoading(true);
      if (!issue || !location || !contact) {
        throw new Error('Please fill out all fields');
      }

      await axios({
        method: 'post',
        url: '/api/tickets/create',
        data: {
          issue: issue,
          location: location,
          contact: contact,
        },
      }).then(async function () {
        await mutate('/api/users/me');
        toast({
          title: 'Ticket Submitted',
          description: 'Please wait for a mentor to arrive',
          status: 'success',
          position: 'bottom-right',
          duration: 3000,
          isClosable: true,
        });
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Ticket length is too long!',
        status: 'error',
        position: 'bottom-right',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitLoading(false);
    }
  }

  async function cancelTicket() {
    if (submitLoading) {
      return;
    }
    try {
      setSubmitLoading(true);
      await axios({
        method: 'post',
        url: '/api/tickets/cancel',
        data: {
          ticketId: data.user.ticket.id,
        },
      }).then(async function () {
        await mutate('/api/users/me');
      });
    } catch (e) {
      const error = e as Error;
      console.log(error.message);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        position: 'bottom-right',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitLoading(false);
    }
  }

  if (data.user?.ticket) {
    return (
      <div className="p-8 bg-white border border-gray-100 shadow-md rounded-xl md:w-[90vw] lg:w-[35vw] 2xl:w-[500px]">
        <p className="font-bold text-3xl text-gray-700">Ticket Submitted</p>
        <p className="mt-4 text-md text-gray-600">
          {data.user.ticket.claimantId
            ? `A mentor has claimed your ticket and is on their way!`
            : 'Your ticket is currently in the queue. A mentor will arrive shortly!'}
        </p>
        <button
          onClick={() => cancelTicket()}
          className={`${
            submitLoading ? 'bg-gray-500' : 'bg-red-500'
          } w-full mt-8 py-4 px-8 text-white font-bold rounded-xl`}
        >
          {submitLoading ? 'Cancelling Ticket' : 'Cancel Ticket'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white border border-gray-100 shadow-md rounded-xl md:w-[90vw] lg:w-[35vw] 2xl:w-[500px]">
      <div className="flex justify-between items-center">
        <p className="font-bold text-3xl text-gray-700">Submit ticket</p>
        <InfoModal email={data.user.email} />
      </div>
      <p className="mt-3 text-md text-gray-600">Issue</p>
      <Input
        id="issue"
        className="mt-2"
        variant="outline"
        placeholder="Issue"
        value={issue}
        onChange={(e) => setIssue(e.target.value)}
      />
      <p className="mt-3 text-md text-gray-600">
        Location (so we can find you!)
      </p>
      <Input
        id="location"
        className="mt-2"
        variant="outline"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <p className="mt-3 text-md text-gray-600">
        Contact (if we can&apos;t find you!)
      </p>
      <Input
        id="contact"
        className="mt-2"
        variant="outline"
        placeholder="Contact"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
      />
      <button
        onClick={() => submitTicket()}
        className={`${
          submitLoading ? 'bg-gray-500' : 'bg-blue-500'
        } w-full mt-8 py-4 px-8 text-white font-bold rounded-xl`}
      >
        {submitLoading ? 'Submitting Ticket' : 'Submit Ticket'}
      </button>
    </div>
  );
}
