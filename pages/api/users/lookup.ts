import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import { EventRoles, User } from '@prisma/client';
import { getToken, JWT } from 'next-auth/jwt';

import prisma from '../../../lib/prisma';
import users from '@/pages/dashboard/users';
import { isMentor } from '@/lib/helpers/permission-helper';

/*
 * GET Request: Returns user info given email
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ user: Nullable<User> }>
) {
  const token: Nullable<JWT> = await getToken({ req });

  const query = req.query;
  const { email } = query;

  if (!token || !email) {
    res.status(401);
    res.send({ user: null });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email as string,
    },
    include: {
      roles: true,
    },
  });

  if (!user) {
    res.status(401);
    res.send({ user: null });
    return;
  }

  const hasMentorRole = await isMentor(user);
  const updatedUser = { ...user, mentor: hasMentorRole };

  res.status(200);
  res.send({ user: updatedUser });
}
