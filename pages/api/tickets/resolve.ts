import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../../lib/prisma';
import { getToken } from 'next-auth/jwt';

/*
 * POST Request: Resolves ticket
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  const { ticketId } = req.body;

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

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!user || !ticket || (!user.admin && !user.mentor)) {
    res.status(401);
    res.send({});
    return;
  }

  if (user.claimedTicket?.id != ticket.id) {
    res.send({});
    return;
  }

  console.log(ticket);

  await prisma.resolvedTicket.create({
    data: {
      authorName: ticket.authorName,
      issue: ticket.issue,
      location: ticket.location,
      contact: ticket.contact,
      publishTime: ticket.publishTime,
      claimedTime: ticket.claimedTime,
      resolvedTime: new Date(),
      claimantId: ticket.claimantId,
      claimantName: ticket.claimantName,
      authorId: ticket.authorId,
    },
  });

  await prisma.ticket.delete({
    where: {
      id: ticketId,
    },
  });

  res.status(200);
  res.send({});
}
