import { Ticket } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Nullable } from '../../../../lib/common';

import prisma from '../../../../lib/prisma';

/*
 * GET Request: Retuns resolved tickets for a given mentor email
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ tickets: Nullable<Ticket[]> }>
) {
  if (req.method !== 'GET') {
    return;
  }

  const { id } = req.query;

  const tickets = await prisma.ticket.findMany({
    where: {
      claimantId: id as string,
      isResolved: true,
    },
    orderBy: {
      publishTime: 'desc',
    },
  });

  res.status(200).send({ tickets: tickets });
}
