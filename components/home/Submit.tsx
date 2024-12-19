import { Input, useToast } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';
import { z } from 'zod';
import {
  fetcher,
  maxIssueLength,
  maxLocationLength,
  maxPhoneLength,
  phoneNumberRegex,
} from '../../lib/common';
import { InfoModal } from './InfoModal';

//Using React Hook Form for form submission
//Zod for validation

const FormSchema = z.object({
  issue: z
    .string()
    .min(1, { message: 'Required' })
    .max(maxIssueLength, { message: 'Too long' }),
  location: z
    .string()
    .min(1, { message: 'Required' })
    .max(maxLocationLength, { message: 'Too long' }),
  phone: z
    .string()
    .min(1, { message: 'Required' })
    .max(maxPhoneLength, { message: 'Too long' })
    .regex(phoneNumberRegex, 'Enter valid number'),
});

type IFormInput = z.infer<typeof FormSchema>;

export const Submit = () => {
  const { data, error, isLoading } = useSWR('/api/users/me', fetcher, {
    refreshInterval: 5000,
  });
  const { mutate } = useSWRConfig();
  const [submitLoading, setSubmitLoading] = useState(false);
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<IFormInput>({
    resolver: zodResolver(FormSchema),
    resetOptions: {
      keepValues: true,
      keepErrors: false,
    },
    reValidateMode: 'onBlur',
    shouldFocusError: false,
  });

  const issue = watch('issue');
  const phone = watch('phone');
  const location = watch('location');

  if (isLoading || error) {
    return <p>Loading</p>;
  }

  const onSubmit: SubmitHandler<IFormInput> = async (
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
          contact: data.phone,
        },
      }).then(async function () {
        toast({
          title: 'Ticket Submitted',
          description: 'Please wait for a mentor to arrive',
          status: 'success',
        });
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'An unexpected error occured!',
        status: 'error',
      });
    } finally {
      await mutate('/api/users/me');
      setSubmitLoading(false);
    }
  };

  const cancelTicket = async () => {
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
  };

  console.log(data.user.ticket);

  if (data.user?.ticket) {
    return (
      <div className="p-8 bg-white border border-gray-100 shadow-md rounded-xl w-full">
        <p className="font-bold text-3xl text-gray-700">Ticket Submitted</p>
        <p className="mt-4 text-md text-gray-600">
          {data.user.ticket.claimantId
            ? `${
                data.user?.ticket?.claimantName || 'A mentor'
              } has claimed your ticket and is on their way!`
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
    <div className="p-8 bg-white border border-gray-100 shadow-md rounded-xl w-full">
      <div className="flex justify-between items-center">
        <p className="font-bold text-3xl text-gray-700">Submit ticket</p>
        <InfoModal email={data.user.email} />
      </div>
      <form
        className="flex flex-col gap-3 mt-3"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <p className="text-md text-gray-600">Issue</p>

            <p
              className={`${
                errors.issue || issue?.length > maxIssueLength
                  ? 'text-crimson'
                  : 'text-gray-600'
              } text-sm transition-all`}
            >
              {errors.issue?.message ||
                `${issue?.length || 0}/${maxIssueLength}`}
            </p>
          </div>
          <Input
            variant="outline"
            placeholder="Issue"
            errorBorderColor="crimson"
            {...register('issue')}
            isInvalid={errors.issue ? true : false}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <p className="text-md text-gray-600">
              Location (so we can find you!)
            </p>
            <p
              className={`${
                errors.location || location?.length > maxLocationLength
                  ? 'text-crimson'
                  : 'text-gray-600'
              } text-sm transition-all`}
            >
              {errors.location?.message ||
                `${location?.length || 0}/${maxLocationLength}`}
            </p>
          </div>

          <Input
            variant="outline"
            placeholder="Location"
            errorBorderColor="crimson"
            {...register('location')}
            isInvalid={errors.location ? true : false}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <p className="text-md text-gray-600">
              Phone (if we can&apos;t find you!)
            </p>

            <p
              className={`${
                errors.phone || phone?.length > maxPhoneLength
                  ? 'text-crimson'
                  : 'text-gray-600'
              } text-sm transition-all`}
            >
              {errors.phone?.message ||
                `${phone?.length || 0}/${maxPhoneLength}`}
            </p>
          </div>

          <Input
            autoComplete="tel-national"
            type="tel"
            variant="outline"
            placeholder="Phone Number"
            errorBorderColor="crimson"
            {...register('phone')}
            isInvalid={errors.phone ? true : false}
          />
        </div>

        <button
          type="submit"
          className={`${
            submitLoading ? '!bg-gray-500' : '!bg-blue-500'
          } w-full !mt-8 !py-4 !px-8 !text-white !font-bold rounded-xl`}
        >
          {submitLoading ? 'Submitting Ticket' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
};
