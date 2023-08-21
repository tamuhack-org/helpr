import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import useSWR from 'swr';
import { fetcher } from '../lib/common';

import Banner from '../components/common/Banner';
import Navbar from '../components/common/Navbar';
import Submit from '../components/home/Submit';

import Loading from '../components/common/Loading';

export default function Home() {
  const session = useSession();
  const router = useRouter();
  const { data, error, isLoading } = useSWR('/api/users/me', fetcher, {
    refreshInterval: 5000,
  });

  if (!session) {
    router.push('/login');
    return;
  }

  if (isLoading || error) {
    return <Loading />;
  }

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
          <div className="w-screen sm:w-auto">
            <div className="flex justify-center mx-4 mb-6 w-[90vw] lg:w-[35vw] 2xl:w-[500px]">
              <Navbar page="home" />
            </div>
            <div className="mx-4">
              <Submit user={data.user} ticket={data.user?.ticket} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
