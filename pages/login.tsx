import { Banner } from '../components/common/Banner';
import { Landing } from '../components/Landing/Landing';
import { GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getSession(ctx);
  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

const Home = () => {
  return (
    <>
      <Banner />
      <Landing />
    </>
  );
};

export default Home;
