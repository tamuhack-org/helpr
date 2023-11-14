import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import { User } from '@prisma/client';
import { getToken, JWT } from 'next-auth/jwt';

import prisma from '../../../lib/prisma';

/*
 * GET Request: Returns all users
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ users: User[] }>
) {
  const token: Nullable<JWT> = await getToken({ req });

  if (!token) {
    res.status(401);
    res.send({ users: [] });
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

  if (!user?.admin) {
    res.status(401);
    res.send({ users: [] });
    return;
  }

  const users = await prisma.user.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  res.status(200);
  res.send({ users: users });
}
