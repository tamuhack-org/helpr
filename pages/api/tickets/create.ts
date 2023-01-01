import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import prisma from '../../../lib/prisma';
import { Ticket } from '@prisma/client';
import { getToken, JWT } from 'next-auth/jwt';

/*
 * POST Request: Creates new ticket and assigns it to user
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ticket: Nullable<Ticket> }>
) {
  const token: Nullable<JWT> = await getToken({ req });

  if (!token) {
    res.status(401);
    res.send({ ticket: null });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: token?.email || '',
    },
  });

  if (!user || user?.ticketId) {
    res.status(409);
    res.send({ ticket: null });
    return;
  }

  if (!req.body.issue || !req.body.location || !req.body.contact) {
    res.status(400);
    res.send({ ticket: null });
    return;
  }

  const ticket = await prisma.ticket.create({
    data: {
      issue: req.body.issue,
      location: req.body.location,
      contact: req.body.contact,
      authorId: user.id,
    },
  });

  await prisma.user.update({
    where: {
      email: user.email || undefined,
    },
    data: {
      ticketId: ticket.id,
    },
  });

  res.status(200);
  res.send({ ticket: ticket });
}
