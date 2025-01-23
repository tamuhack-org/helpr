'use client';

import { ChevronRight, Home, type LucideIcon } from 'lucide-react';

import Link from 'next/link';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import useNavStore from '@/stores/useNavStore';

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

function RenderParentItem(item: NavItem) {
  const { categories, setCategories } = useNavStore((state) => state);

  if (!item.items) {
    return (
      <SidebarMenuButton key={item.title} asChild>
        <Link href={item.url}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    );
  }

  if (!categories.length) {
    return;
  }

  return (
    <Collapsible
      key={item.title}
      asChild
      className="group/collapsible"
      defaultOpen={
        categories.find((category) => category.name === item.title)?.isOpen
      }
      onOpenChange={(isOpen) => {
        if (!categories.find((category) => category.name === item.title)) {
          setCategories([
            ...categories,
            {
              name: item.title,
              isOpen: isOpen,
            },
          ]);

          return;
        }

        const updatedCategories = categories.map((category) => {
          if (category.name === item.title) {
            return {
              ...category,
              isOpen: isOpen,
            };
          }
          return category;
        });
        setCategories(updatedCategories);
      }}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton asChild>
                  <Link href={subItem.url}>
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarMenuButton asChild>
        <Link href={'/'}>
          <Home />
          <span>Home</span>
        </Link>
      </SidebarMenuButton>
      <div className="spacer my-1" />
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarMenu>{items.map((item) => RenderParentItem(item))}</SidebarMenu>
    </SidebarGroup>
  );
}
