import Link from 'next/link';

import { fetcher } from '../lib/common';
import useSWR from 'swr';

import Navbar from '../components/common/Navbar';
import Banner from '../components/common/Banner';
import Loading from '../components/common/Loading';
import QrReader from '../components/admin/scanner/QrReader';
import { MdDashboard } from 'react-icons/md';

export default function Home() {
  const { error, isLoading } = useSWR('/api/users/all', fetcher, {});

  if (isLoading || error) {
    return <Loading />;
  }

  return (
    <div className="h-full py-10">
      <Banner />
      <div className="flex flex-row justify-center mx-4 mt-8 md:mt-24">
        <div className="flex flex-col gap-6 justify-center sm:w-auto w-[90vw] lg:w-[35vw] 2xl:w-[500px]">
          <Navbar page="admin" />
          <div className="flex flex-col gap-8 w-full">
            <Link
              href="/dashboard/overview"
              className="flex flex-row items-center justify-center text-center py-4 px-8 bg-blue-500 text-white font-bold rounded-xl shadow-xl cursor-pointer w-full gap-3"
            >
              <MdDashboard size={24} />
              View full admin dashboard
            </Link>
            <QrReader />
          </div>
        </div>
      </div>
    </div>
  );
}
