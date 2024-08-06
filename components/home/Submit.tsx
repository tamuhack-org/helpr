import React from 'react';
import axios from 'axios';
import { Input } from '@chakra-ui/react';
import InfoModal from './InfoModal';
import useSWR from 'swr';
import { fetcher } from '../../lib/common';
import { useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { useForm, SubmitHandler } from 'react-hook-form';

//Using React Hook Form for for submission
//Just using the built in validation for this simple case, but look into Zod or Yup for more complex validation

type Inputs = {
  issue: string;
  location: string;
  contact: string;
};

export default function Submit() {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    resetOptions: { keepValues: true },
  });

  const onSubmit: SubmitHandler<Inputs> = async (
    data,
    e?: React.BaseSyntheticEvent
  ) => {
    e?.preventDefault();

    try {
      setSubmitLoading(true);
      await axios({
        method: 'post',
        url: '/api/tickets/create',
        data: {
          issue: data.issue,
          location: data.location,
          contact: data.contact,
        },
      }).then(async function () {
        await mutate('/api/users/me');
        toast({
          title: 'Ticket Submitted',
          description: 'Please wait for a mentor to arrive',
          status: 'success',
        });
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Ticket length is too long!',
        status: 'error',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const { data, error, isLoading } = useSWR('/api/users/me', fetcher);

  const { mutate } = useSWRConfig();
  const [submitLoading, setSubmitLoading] = useState(false);

  if (isLoading || error) {
    return <p>Loading</p>;
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

      reset();
    } catch (e) {
      const error = e as Error;
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
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
      <form
        className="flex flex-col gap-3 mt-3"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-2">
          <p className="text-md text-gray-600">Issue</p>
          <Input
            variant="outline"
            placeholder="Issue"
            errorBorderColor="crimson"
            {...register('issue', { required: true, maxLength: 80 })}
            isInvalid={errors.issue ? true : false}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-md text-gray-600">
            Location (so we can find you!)
          </p>
          <Input
            variant="outline"
            placeholder="Location"
            errorBorderColor="crimson"
            {...register('location', { required: true, maxLength: 60 })}
            isInvalid={errors.location ? true : false}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-md text-gray-600">
            Contact (if we can&apos;t find you!)
          </p>
          <Input
            variant="outline"
            placeholder="Contact"
            errorBorderColor="crimson"
            {...register('contact', { required: true, maxLength: 20 })}
            isInvalid={errors.contact ? true : false}
          />
        </div>

        <button
          type="submit"
          className={`${
            submitLoading ? 'bg-gray-500' : 'bg-blue-500'
          } w-full mt-8 py-4 px-8 text-white font-bold rounded-xl`}
        >
          {submitLoading ? 'Submitting Ticket' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
}
