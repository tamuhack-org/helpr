import { Ticket } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Nullable } from '../../../lib/common';

import prisma from '../../../lib/prisma';

/*
 * GET Request: Returns all resolved tickets
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ tickets: Nullable<Ticket[]> }>
) {
  if (req.method !== 'GET') {
    return;
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      isResolved: true,
    },
    orderBy: {
      publishTime: 'desc',
    },
  });

  res.status(200).send({ tickets: tickets });
}
