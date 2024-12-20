import { Ticket } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Nullable } from '../../../../lib/common';

import prisma from '../../../../lib/prisma';

//TODO: Make sure this is good.
/*
 * GET Request: Returns resolved ticket analytics in JSON format
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ tickets: Nullable<Ticket[]> }>
) {
  if (req.method !== 'GET') {
    return;
  }

  const allTickets = await prisma.ticket.findMany({
    orderBy: {
      publishTime: 'desc',
    },
  });

  // const activeTickets = allTickets.filter(
  //   (ticket: Ticket) => ticket.resolvedTime === null
  // );
  // const resolvedTickets = allTickets.filter(
  //   (ticket: Ticket) => ticket.resolvedTime !== null
  // );

  res.status(200).send({ tickets: allTickets });
}
