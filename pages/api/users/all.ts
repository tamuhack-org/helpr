import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import { EventRoles, User } from '@/generated/prisma/client';
import { getToken, JWT } from 'next-auth/jwt';

import prisma from '../../../lib/prisma';
import { getActiveEvent } from '@/lib/eventHelper';

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
  });

  if (!user?.admin) {
    res.status(401);
    res.send({ users: [] });
    return;
  }

  const activeEvent = await getActiveEvent();

  const users = await prisma.user.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      roles: true,
    },
  });

  const updatedUsers = users.map((user) => {
    const role = user.roles?.find(
      (role: EventRoles) => role.eventId === activeEvent?.id
    );

    user.mentor = role?.mentor ?? false;
    return user;
  });

  res.status(200);
  res.send({ users: updatedUsers });
}
