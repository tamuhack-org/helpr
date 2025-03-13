import { ReactNode } from 'react';
import Head from 'next/head';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '../common/Sidebar';
import { SessionProvider } from 'next-auth/react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@radix-ui/react-separator';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '../ui/breadcrumb';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Head>
        <title>HelpR</title>
        <meta
          name="description"
          content="One-stop-shop for help and mentoring"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SessionProvider>
        <SidebarProvider>
          <AppSidebar />
          <div className="w-full h-screen">
            <SidebarInset className="h-screen bg-white">
              <header className="w-full flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Team</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </header>
              <div className="w-full h-full overflow-x-auto">{children}</div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </SessionProvider>
    </>
  );
}
