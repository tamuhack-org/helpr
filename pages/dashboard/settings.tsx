import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { EventRequests } from '@/lib/helpers/requests/event-requests';
import { mutate } from 'swr';
import { GetServerSideProps } from 'next';
import { getServerSession, Session } from 'next-auth';
import { type ReactElement } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Nullable } from '../../lib/common';
import prisma from '../../lib/prisma';
import authOptions from '../api/auth/[...nextauth]';
import useEventStore from '@/stores/useEventStore';
import GeneralEventSettingsBlock from '@/components/settings/GeneralEventSettingsBlock';
import DangerEventSettingsBlock from '@/components/settings/DangerEventSettingsBlock';
//set active event to deconstruct a second value from the store
const Settings = () => {
  const { activeEvent, setActiveEvent } = useEventStore((state) => state);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  	
  const handleAddEvent = async () => { 
    if (!name) return;

    const response = await EventRequests.createEvent({ name });
    const data = await response.json();

    setActiveEvent(data.event);
    mutate('/api/events/');

    setName('');
    setOpen(false);
  };

  if (!activeEvent) {
    return <p>Loading</p>;
  }

  return (
    <div className="mx-auto w-5xl px-6 md:max-w-5xl mt-8">
      <div className="flex items-center justify-between">
      	<p className="font-semibold text-3xl">Event Settings</p>
	<Dialog open={open} onOpenChange={setOpen}>
	  <DialogTrigger asChild>
	    <Button>Add Event</Button>
          </DialogTrigger>
	  <DialogContent>
	    <DialogHeader>
	      <DialogTitle>Add Event</DialogTitle>
	      <DialogDescription>Give your new event a name.</DialogDescription>
	    </DialogHeader>
	    <Input
	      value={name}
	      onChange={(e) => setName(e.target.value)}
	      placeholder="Event name"
	    />
	    <DialogFooter>
	      <Button onClick={handleAddEvent}>Create</Button>
	    </DialogFooter>
	  </DialogContent>
	</Dialog>
      </div>
      <GeneralEventSettingsBlock />
      <DangerEventSettingsBlock />
    </div>
  );
};

//TODO: Abstract auth in middleware
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
