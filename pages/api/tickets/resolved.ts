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

  const activeEvent = await getActiveEvent();

  if (!activeEvent) {
    res.status(500);
    res.send({ tickets: null });
    return;
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      isResolved: true,
      eventId: activeEvent.id,
    },
    orderBy: {
      publishTime: 'desc',
    },
  });

  res.status(200).send({ tickets: tickets });
}
