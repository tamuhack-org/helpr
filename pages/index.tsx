import Head from 'next/head';

import Banner from '../components/common/Banner';
import Landing from '../components/Landing/Landing';

export default function Home() {
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
      <Landing />
    </>
  );
}
