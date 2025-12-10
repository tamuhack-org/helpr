import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import { User } from '@/generated/prisma/client';
import { getToken, JWT } from 'next-auth/jwt';

import prisma from '../../../lib/prisma';

/*
 * POST Request: Toggles admin status of a user
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ user: Nullable<User> }>
) {
  const token: Nullable<JWT> = await getToken({ req });
  const { id, currentRole } = req.body;

  if (!token) {
    res.status(401);
    res.send({ user: null });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: token?.email || '',
    },
  });

  if (!user?.admin || user.id === id) {
    res.status(401);
    res.send({ user: null });
    return;
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      admin: !currentRole,
    },
  });

  res.status(200);
  res.send({ user: updatedUser });
}
