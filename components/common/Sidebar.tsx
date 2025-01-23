import * as React from 'react';
import {
  BookOpen,
  ChartLineIcon,
  Dog,
  Mail,
  Settings2,
  Users,
} from 'lucide-react';

import { NavMain } from './NavMain';
import { NavUser } from './NavUser';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavEvents } from './NavEvents';

// This is sample data.
const data = {
  navMain: [
    {
      title: 'Users',
      url: '/dashboard/users',
      icon: Users,
    },
    {
      title: 'Analytics',
      url: '/dashboard/overview',
      icon: ChartLineIcon,
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '/dashboard/settings',
        },
      ],
    },
  ],
  recents: [
    {
      name: 'Campaigns',
      url: '#',
      icon: Mail,
    },
    {
      name: 'Team Settings',
      url: '/settings/team',
      icon: Dog,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavEvents />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
