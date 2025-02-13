import * as React from 'react';
import { ChevronsUpDown, Ellipsis, GalleryVerticalEnd } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { fetcher } from '@/lib/common';
import useSWR, { mutate } from 'swr';
import { Event } from '@prisma/client';
import { useRouter } from 'next/router';
import useEventStore from '@/stores/useEventStore';

export function NavEvents({}: {}) {
  const { activeEvent, setActiveEvent } = useEventStore((state) => state);
  const { data, isLoading, error } = useSWR('/api/events/', fetcher);

  const router = useRouter();
  const { isMobile } = useSidebar();

  if (!isLoading && !error && data?.events) {
    //Takes care of the case where the active event is deleted server-side
    const hasActiveEvent = data.events.some(
      (event: Event) => event.id === activeEvent?.id
    );

    if (!hasActiveEvent) {
      if (data.events.length > 0) {
        setActiveEvent(data.events[0]);
      } else {
        router.push('/dashboard/events');
      }
    }
  }

  const events = data?.events?.slice(0, 3) ?? [];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeEvent?.name || 'No Project'}
                </span>
                <span className="truncate text-xs">
                  {activeEvent?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg z-[10000]"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Recent
            </DropdownMenuLabel>
            {events?.map((event: Event, index: number) => (
              <DropdownMenuItem
                key={event.name}
                onClick={() => {
                  mutate('/api/events/');

                  const hasActiveEvent = data.events.some(
                    (serverEvent: Event) => event.id === serverEvent?.id
                  );

                  if (hasActiveEvent) {
                    setActiveEvent(event);
                  }

                  router.reload();
                }}
                className="flex items-center justify-between gap-2 p-2 cursor-pointer"
              >
                {event.name}
                <div
                  className={`w-2 h-2 rounded-full ${
                    event.isActive ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                ></div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2 cursor-pointer">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Ellipsis className="size-4" />
              </div>
              <Link
                href="/dashboard/events"
                className="font-medium text-muted-foreground"
              >
                View all
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
