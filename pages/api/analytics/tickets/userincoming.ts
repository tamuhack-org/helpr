import { Ticket } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Nullable } from '../../../../lib/common';

import prisma from '../../../../lib/prisma';

/*
 * GET Request: Returns incoming ticket analytics in JSON format
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ tickets: Nullable<Ticket[]> }>
) {
  if (req.method !== 'GET') {
    return;
  }

  const { authorId } = req.query;

  const resolvedTickets = await prisma.resolvedTicket.findMany({
    where: {
      authorId: authorId as string,
      NOT: {
        resolvedTime: null,
      },
    },
    orderBy: {
      publishTime: 'desc',
    },
  });

  const activeTickets = await prisma.ticket.findMany({
    where: {
      authorId: authorId as string,
      resolvedTime: null,
    },
    orderBy: {
      publishTime: 'desc',
    },
  });

  const totalTickets = activeTickets.concat(resolvedTickets);

  res.status(200).send({ tickets: totalTickets });
}
