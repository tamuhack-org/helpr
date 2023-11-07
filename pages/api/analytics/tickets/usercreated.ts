import { ResolvedTicket } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Nullable } from '../../../../lib/common';

import prisma from '../../../../lib/prisma';

/*
 * GET Request: Returns all tickets created by a user
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ totalTicketsCreated: Nullable<number> }>
) {
  if (req.method !== 'GET') {
    return;
  }

  const { userId } = req.query;

  const unresolvedTickets = await prisma.ticket.findMany({
    where: {
      authorId: userId as string,
    },
    orderBy: {
      publishTime: 'desc',
    },
  });

  const resolvedTickets = await prisma.resolvedTicket.findMany({
    where: {
      authorId: userId as string,
      NOT: {
        resolvedTime: null,
      },
    },
    orderBy: {
      publishTime: 'desc',
    },
  });

  const totalTicketsCreated = unresolvedTickets.length + resolvedTickets.length;

  res.status(200).send({ totalTicketsCreated: totalTicketsCreated });
}
