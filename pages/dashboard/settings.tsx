import { GetServerSideProps } from 'next';
import { getServerSession, Session } from 'next-auth';
import { type ReactElement } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Nullable } from '../../lib/common';
import prisma from '../../lib/prisma';
import authOptions from '../api/auth/[...nextauth]';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { mutate } from 'swr';
import { EventRequests } from '@/lib/helpers/requests/event-requests';
import useEventStore from '@/stores/useEventStore';

const Settings = () => {
  const { activeEvent } = useEventStore((state) => state);
  if (!activeEvent) {
    return <p>Loading</p>;
  }

  return (
    <div className="mx-auto w-5xl px-6 md:max-w-5xl mt-8">
      <p className="font-semibold text-3xl">Event Settings</p>

      <BasicInformationSection />
    </div>
  );
};

const BasicInformationSection = () => {
  const { toast } = useToast();
  const { activeEvent, setActiveEvent } = useEventStore((state) => state);
  const FormSchema = z.object({
    name: z
      .string()
      .min(2, {
        message: 'Name must be at least 2 characters.',
      })
      .optional(),
    bannerText: z.string().optional(),
    url: z.string().optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: activeEvent?.name || '',
      url: activeEvent?.url || '',
      bannerText: activeEvent?.bannerText || '',
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const eventPayload = {
      eventId: activeEvent?.id,
      name: data.name === activeEvent?.name ? undefined : data.name,
      bannerText:
        data.bannerText === activeEvent?.bannerText
          ? undefined
          : data.bannerText,
      url: data.url === activeEvent?.url ? undefined : data.url,
    };

    const response = await EventRequests.updateEvent(eventPayload);

    const newEvent = await response.json();

    toast({
      title: 'Updated Event Data',
      description: 'Your changes will be reflected in the application shortly.',
    });
    setActiveEvent(newEvent.event);
    mutate('/api/events/');
  };

  return (
    <div className="flex justify-between mt-4 gap-8 border-b-2 border-gray-200 pb-4">
      <div className="mt-4 w-1/2">
        <p className="text-lg font-semibold">General Info</p>
        <p className="opacity-80">
          View and update public-facing information about your event.
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 py-4 w-1/2"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Name</FormLabel>
                <FormControl>
                  <Input placeholder={activeEvent?.name} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bannerText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner Text</FormLabel>
                <FormControl>
                  <Input
                    placeholder={activeEvent?.bannerText || 'None'}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  If set, a banner will display your message to participants.
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Live Site URL:</FormLabel>
                <FormControl>
                  <Input placeholder={activeEvent?.url || 'None'} {...field} />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  If set, the banner will link to a URL.{' '}
                </FormDescription>
              </FormItem>
            )}
          />
          <div className="pt-2">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

//TODO: Abstract auth in middleware
//
//Check if user is authenticated
//If not, redirect to login page
//Then check if user is admin
//If not, redirect to home page
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session: Nullable<Session> = await getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user?.email || '',
    },
  });

  if (!user?.admin) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

Settings.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Settings;
