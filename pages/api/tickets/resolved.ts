import { Ticket } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Nullable } from '../../../lib/common';
import { getActiveEvent } from '../../../lib/eventHelper';

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

  const eventId = req.query.eventId;

  const tickets = await prisma.ticket.findMany({
    where: {
      isResolved: true,
      eventId: eventId as string,
    },
    orderBy: {
      publishTime: 'desc',
    },
    include: {
      claimant: true,
    },
  });

  res.status(200).send({ tickets: tickets });
}
