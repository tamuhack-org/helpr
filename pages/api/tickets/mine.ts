import { Ticket } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Nullable } from '../../../lib/common';

import prisma from '../../../lib/prisma';
import { getToken } from 'next-auth/jwt';
import { getActiveEvent } from '../../../lib/eventHelper';

/*
 * GET Request: Returns all tickets associated with the current user
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ tickets: Nullable<Ticket[]> }>
) {
  const token = await getToken({ req });

  if (req.method !== 'GET') {
    return;
  }

  if (!token) {
    res.status(401);
    res.send({ tickets: null });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: token?.email || '',
    },
  });

  const activeEvent = await getActiveEvent();

  const tickets = await prisma.ticket.findMany({
    where: {
      claimantId: user?.id,
      eventId: activeEvent?.id,
    },
    orderBy: {
      publishTime: 'desc',
    },
    include: {
      claimant: true,
    },
  });

  res.status(200).send({ tickets });
}
