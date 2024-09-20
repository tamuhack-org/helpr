import { ReactElement } from 'react';
import { MainLayout } from '../components/common/MainLayout';
import { Submit } from '../components/home/Submit';

const Home = () => {
  return (
    <div className="mx-4">
      <Submit />
    </div>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout page="home">{page}</MainLayout>;
};

export default Home;
