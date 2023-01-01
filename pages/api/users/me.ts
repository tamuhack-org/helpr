import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import { User } from '@prisma/client';
import { getToken, JWT } from 'next-auth/jwt';

import prisma from '../../../lib/prisma';
/*
 * GET Request: Returns current user
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ user: Nullable<User> }>
) {
  const token: Nullable<JWT> = await getToken({ req });

  if (!token) {
    res.status(401);
    res.send({ user: null });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: token?.email || '',
    },
    include: {
      ticket: true,
    },
  });

  res.status(200);
  res.send({ user: user });
}
