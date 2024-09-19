import Link from 'next/link';

import Navbar from '../components/common/Navbar';
import Banner from '../components/common/Banner';
import QrReader from '../components/admin/scanner/QrReader';
import { MdDashboard } from 'react-icons/md';
import { AdminTable } from '../components/admin/AdminTable';

const Home = () => {
  return (
    <div className="h-screen py-10">
      <Banner />
      <div className="flex flex-row justify-center mx-4 mt-8 md:mt-24">
        <div className="flex flex-col gap-2 justify-center sm:w-auto w-[90vw] lg:w-[35vw] 2xl:w-[500px]">
          <Navbar page="admin" />
          <div className="flex flex-col w-full">
            <div className="flex md:flex-row flex-col gap-2">
              <Link
                href="/dashboard/overview"
                className="flex flex-row items-center justify-center text-center py-4 px-8 bg-blue-500 text-white font-bold rounded-xl cursor-pointer w-full gap-3"
              >
                <MdDashboard size={24} />
                Analytics
              </Link>
              <QrReader />
            </div>
            <AdminTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
