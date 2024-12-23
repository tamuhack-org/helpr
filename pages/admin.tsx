import Link from 'next/link';
import { ReactElement } from 'react';
import { MdDashboard } from 'react-icons/md';
import { AdminTable } from '../components/admin/AdminTable';
import QrReader from '../components/admin/scanner/QrReader';
import { MainLayout } from '../components/common/MainLayout';

const Admin = () => {
  return (
    <div className="w-full">
      <div className="flex md:flex-row flex-col gap-2">
        <Link
          href="/dashboard/overview"
          className="flex flex-row items-center justify-center text-center py-4 px-8 bg-blue-500 text-white font-bold rounded-xl cursor-pointer w-full gap-3"
        >
          <MdDashboard size={24} />
          Dashboard
        </Link>
        <QrReader />
      </div>
      <AdminTable />
    </div>
  );
};

Admin.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout page="admin">{page}</MainLayout>;
};

export default Admin;
