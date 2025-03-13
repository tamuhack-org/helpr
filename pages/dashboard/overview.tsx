import DashboardLayout from '../../components/dashboard/DashboardLayout';

import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../_app';
import {
  MiniResolvedTickets,
  MiniIncomingTickets,
} from '../../components/dashboard/overview/MiniIncomingTickets';
import Leaderboard from '../../components/dashboard/overview/Leaderboard';
import Topics from '../../components/dashboard/overview/Topics';

const Overview: NextPageWithLayout = () => {
  return (
    <div className="mx-auto w-5xl px-6 md:max-w-5xl mt-8">
      <p className="text-4xl font-bold">Overview</p>
      <p className="text-gray-500 mt-1">
        Get a quick glimpse of how your mentors are doing.
      </p>
      <div className="flex overflow-y-auto mt-8 gap-2">
        <MiniIncomingTickets />
        <MiniResolvedTickets />
      </div>
      <div className="mt-8">
        <p className="text-3xl font-bold mb-4">Leaderboard</p>
        <Leaderboard />
      </div>
      <div className="mt-8 mb-8">
        <p className="text-3xl font-bold mb-4">Topics</p>
        <Topics />
      </div>
    </div>
  );
};

Overview.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Overview;
