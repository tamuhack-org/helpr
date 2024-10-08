import { ReactElement } from 'react';
import { MainLayout } from '../components/common/MainLayout';
import { Submit } from '../components/home/Submit';

const Home = () => {
  return <Submit />;
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout page="home">{page}</MainLayout>;
};

export default Home;
