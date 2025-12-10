import { Ticket } from '@/generated/prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Nullable } from '../../../lib/common';
import { getActiveEvent } from '../../../lib/eventHelper';

import prisma from '../../../lib/prisma';

/*
 * GET Request: Returns active tickets (claimed OR unresolved)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ tickets: Nullable<Ticket[]> }>
) {
  if (req.method !== 'GET') {
    return;
  }

  const activeEvent = await getActiveEvent();

  const tickets = await prisma.ticket.findMany({
    where: {
      isResolved: false,
      eventId: activeEvent?.id,
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
