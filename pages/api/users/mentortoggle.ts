import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import { User } from '@prisma/client';
import { getToken, JWT } from 'next-auth/jwt';

import prisma from '../../../lib/prisma';
import { getActiveEvent } from '@/lib/eventHelper';

/*
 * POST Request: Toggles mentor status of a user
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
      admin: true,
    },
  });

  if (!user) {
    res.status(401);
    res.send({ user: null });
    return;
  }

  const activeEvent = await getActiveEvent();

  if (!activeEvent) {
    res.status(500);
    res.send({ user: null });
    return;
  }

  await prisma.eventRoles.upsert({
    where: {
      eventId_userId: {
        userId: id,
        eventId: activeEvent.id,
      },
    },
    update: {
      mentor: !currentRole,
    },
    create: {
      userId: id,
      eventId: activeEvent.id,
      mentor: !currentRole,
    },
  });

  res.status(200);
  res.send({ user: null });
}
