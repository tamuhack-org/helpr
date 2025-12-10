import { Ticket } from '@/generated/prisma/client';
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

  const tickets = await prisma.ticket.findMany({
    where: {
      authorId: authorId as string,
    },
    orderBy: {
      publishTime: 'desc',
    },
  });

  res.status(200).send({ tickets });
}
