import { ResolvedTicket } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Nullable } from '../../../lib/common';

import prisma from '../../../lib/prisma';

/*
 * GET Request: Returns all tickets
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ tickets: Nullable<ResolvedTicket[]> }>
) {
  if (req.method !== 'GET') {
    return;
  }

  const tickets = await prisma.resolvedTicket.findMany({
    where: {
      NOT: {
        resolvedTime: null,
      },
    },
    orderBy: {
      publishTime: 'desc',
    },
  });

  res.status(200).send({ tickets: tickets });
}
