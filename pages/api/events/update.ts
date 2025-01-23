import type { NextApiRequest, NextApiResponse } from 'next';

import { Event } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { getToken } from 'next-auth/jwt';
import { Nullable } from '@/lib/common';

/*
 * POST Request: Updates project
 */

type ResponseData = {
  event?: Nullable<Event>;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const token = await getToken({ req });

  if (!token) {
    res.status(401);
    res.send({ event: null });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: token?.email || '',
      admin: true,
    },
  });

  if (!user) {
    res.status(400);
    res.send({ event: null });
    return;
  }

  const { eventId, name, isActive, url, bannerText } = req.body;

  const event = await prisma.event.update({
    where: {
      id: eventId,
    },
    data: {
      name,
      isActive,
      url,
      bannerText,
    },
  });

  res.status(200).send({ event });
}
