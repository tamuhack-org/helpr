import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import prisma from '../../../lib/prisma';
import { Ticket } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

/*
 * POST Request: Creates new ticket and assigns it to user
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ticket: Nullable<Ticket> }>
) {
  const token = await getToken({ req });
  const { issue, location, contact } = req.body;

  if (!token) {
    res.status(401);
    res.send({ ticket: null });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: token?.email || '',
    },
    include: {
      ticket: true,
    },
  });

  if (!user || user?.ticket) {
    res.status(409);
    res.send({ ticket: null });
    return;
  }

  if (!issue || !location || !contact) {
    res.status(400);
    res.send({ ticket: null });
    return;
  }

  const ticket = await prisma.ticket.create({
    data: {
      authorName: user.name,
      issue: issue,
      location: location,
      contact: contact,
      author: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  res.status(200);
  res.send({ ticket: ticket });
}
