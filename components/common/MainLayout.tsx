import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import { ReactNode, useEffect } from 'react';
import { useSettings } from '../../lib/settings/settings';
import { Banner } from './Banner';
import { Navbar, PageOption } from './Navbar';

export const MainLayout = ({
  children,
  page,
}: {
  children: ReactNode;
  page: PageOption;
}) => {
  const { data, error, isLoading } = useSettings();

  useEffect(() => {
    if (isLoading || error) {
      return;
    }

    console.log('Consuming data');
    console.log(data);
  }, []);

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
          <div className="justify-center mx-4 mb-6 w-[90vw] lg:w-[40vw] 2xl:w-[550px]">
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
