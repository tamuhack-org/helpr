import { Ticket } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Nullable } from '../../../lib/common';

import prisma from '../../../lib/prisma';
import { getToken } from 'next-auth/jwt';

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
    res.send({ ticket: [] });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: token?.email || '',
    },
    include: {
      claimedTicket: true,
      ticket: true,
    },
  });

  const tickets = await prisma.ticket.findMany({
    where: {
      claimantId: user?.id,
    },
    orderBy: {
      publishTime: 'desc',
    },
    include: {
      claimant: true,
    },
  });

  const resolvedTickets = await prisma.resolvedTicket.findMany({
    where: {
      claimantId: user?.id,
    },
    orderBy: {
      publishTime: 'desc',
    },
  });

  res.status(200).send({ tickets: [...tickets, ...resolvedTickets] });
}
