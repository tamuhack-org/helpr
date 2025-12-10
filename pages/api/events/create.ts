import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../../lib/prisma';
import { Event } from '@/generated/prisma/client';
import { getToken } from 'next-auth/jwt';
import { Nullable } from '../../../lib/common';

/*
 * POST Request: Creates new event
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ event: Nullable<Event> }>
) {
  const token = await getToken({ req });
  const { name = 'New Event' } = req.body;

  if (!token) {
    res.status(401);
    res.send({ event: null });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: token?.email || '',
      admin: true,
    },
  });

  if (!user) {
    res.status(400);
    res.send({ event: null });
    return;
  }

  const event = await prisma.event.create({
    data: { name: name, isActive: true },
  });

  res.status(200).send({ event: event });
}
