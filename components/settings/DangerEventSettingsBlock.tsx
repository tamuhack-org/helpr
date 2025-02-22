import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { mutate } from 'swr';
import { EventRequests } from '@/lib/helpers/requests/event-requests';
import useEventStore from '@/stores/useEventStore';
import SettingsBlockTemplate from './SettingsBlockTemplate';
import { SettingsButtonRow } from './SettingsButtonRow';

export const DangerEventSettingsBlock = () => {
  const { toast } = useToast();
  const { activeEvent, setActiveEvent } = useEventStore((state) => state);

  const toggleActivation = async () => {
    const eventPayload = {
      eventId: activeEvent?.id,
      isActive: !activeEvent?.isActive,
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

  if (!activeEvent) {
    return <p>Loading</p>;
  }

  const description = activeEvent?.isActive
    ? 'Deactive this event. New incoming tickets will not be assigned to an event unless another event is actived'
    : 'Activate this event. The current active event will be deactivated and new tickets will be assigned to this event.';

  return (
    <div className="flex flex-col gap-4 my-8">
      <SettingsButtonRow
        title={`${activeEvent?.isActive ? 'Deactivate' : 'Activate'} Event`}
        buttonText={`${activeEvent?.isActive ? 'Deactivate' : 'Activate'}`}
        description={description}
        onSubmit={toggleActivation}
      />
    </div>
  );
};

export default DangerEventSettingsBlock;
