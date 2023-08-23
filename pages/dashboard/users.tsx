import DashboardLayout from '../../components/dashboard/DashboardLayout';

import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../_app';

const Users: NextPageWithLayout = () => {
  return <p>Hi</p>;
};

Users.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Users;
