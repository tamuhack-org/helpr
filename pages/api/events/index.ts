import { Event } from '@/generated/prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Nullable } from '../../../lib/common';

import prisma from '../../../lib/prisma';

/*
 * GET Request: Returns all events
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ events: Nullable<Event[]> }>
) {
  if (req.method !== 'GET') {
    return;
  }

  const events = await prisma.event.findMany({
    orderBy: {
      updatedTime: 'desc',
    },
  });

  res.status(200).send({ events });
}
