import { Event } from '@/generated/prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Nullable } from '../../../lib/common';
import { getActiveEvent } from '../../../lib/eventHelper';

/*
 * GET Request: Returns active event
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ event: Nullable<Event> }>
) {
  if (req.method !== 'GET') {
    return;
  }

  const activeEvent = await getActiveEvent();

  res.status(200).send({ event: activeEvent });
}
