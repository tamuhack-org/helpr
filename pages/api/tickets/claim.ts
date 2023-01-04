import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import prisma from '../../../lib/prisma';
import { Ticket } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

/*
 * POST Request: Claims Ticket
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ticket: Nullable<Ticket> }>
) {
  const token = await getToken({ req });
  const { ticketId } = req.body;

  console.log('TOKEN GOT');

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
      claimedTicket: true,
      ticket: true,
    },
  });
  console.log('USER GOT');

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });
  console.log('TICKET GOT');

  if (!user || !ticket || (!user.admin && !user.mentor)) {
    res.status(401);
    res.send({ ticket: null });
    return;
  }

  if (user.claimedTicket || ticket.claimantId) {
    res.send({ ticket: null });
    return;
  }

  await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      claimantName: user.name,
      claimedTime: new Date(),
      claimant: {
        connect: {
          id: user.id,
        },
      },
    },
  });
  console.log('TICKET UPDATED');

  res.status(200);
  res.send({ ticket: ticket });
}
