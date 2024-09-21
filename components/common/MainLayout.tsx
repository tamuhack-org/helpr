import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import { ReactNode } from 'react';
import { Banner } from './Banner';
import { Navbar, PageOption } from './Navbar';

export const MainLayout = ({
  children,
  page,
}: {
  children: ReactNode;
  page: PageOption;
}) => {
  return (
    <>
      <Head>
        <title>HelpR</title>
        <meta
          name="description"
          content="Online Mentorship Queue For Hackathon Participants"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="h-full py-10">
        <Banner />
        <div className="flex justify-center mt-8 md:mt-24">
          <div className="justify-center mx-4 mb-6 w-[90vw] lg:w-[35vw] 2xl:w-[500px]">
            <SessionProvider>
              <Navbar page={page} />
            </SessionProvider>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
