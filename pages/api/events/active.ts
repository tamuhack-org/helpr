import { Event } from '@prisma/client';
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

  if (!activeEvent) {
    res.status(500);
    res.send({ event: null });
    return;
  }

  res.status(200).send({ event: activeEvent });
}
