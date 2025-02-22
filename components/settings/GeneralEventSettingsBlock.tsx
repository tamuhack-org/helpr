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
import { SettingsInputForm } from './SettingsInputForm';

export const GeneralEventSettingsBlock = () => {
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
    <SettingsBlockTemplate
      title="General Info"
      desc="View and update public-facing information about your event."
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 py-4 md:w-1/2"
        >
          <SettingsInputForm
            form={form}
            name="Event Name"
            placeholder={activeEvent?.name || 'Event Name'}
          />
          <SettingsInputForm
            form={form}
            name="Banner Text"
            placeholder={activeEvent?.bannerText || 'None'}
            tooltip="If set, a banner will display your message to participants."
          />
          <SettingsInputForm
            form={form}
            name="Live Site URL"
            placeholder={activeEvent?.url || 'None'}
            tooltip="If set, the banner will link to a URL."
          />
          <div className="pt-2">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </SettingsBlockTemplate>
  );
};

export default GeneralEventSettingsBlock;
