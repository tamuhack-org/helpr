import Head from 'next/head';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Inter } from '@next/font/google';
import axios from 'axios';

import Banner from '../components/common/Banner';
import Landing from '../components/Landing/Landing';
import Navbar from '../components/common/Navbar';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const { data: session } = useSession();
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    if (session) {
      getUser();
    }
  }, [session]);

  async function getUser() {
    try {
      const resp = await axios.get('/api/users/me');
      setUser(resp.data);
    } catch (e) {
      console.log(e);
    }
  }

  if (!session) {
    return <Landing />;
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

      <Banner />
      <div className="flex justify-center items-center mt-8 md:mt-24">
        <div>
          <div className="flex justify-between mx-4 mb-6">
            <Navbar user={user} page="home" />
          </div>
          <p>{session?.user?.email}</p>
        </div>
      </div>
    </>
  );
}
