import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../../lib/prisma';
import { getToken } from 'next-auth/jwt';
import { Ticket } from '@prisma/client';
import { UserWithClaimedTicket } from '../../../components/common/types';

//If the claimed ticket is resolved by an admin that did not claim the ticket, make the admin the claimant
//Probably better than leaving the claimant null or assigning it to the previous claimant
const updateTicket = async (user: UserWithClaimedTicket, ticket: Ticket) => {
  const isClaimant = user.claimedTicket?.id !== ticket.id;

  if (!isClaimant) {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isResolved: true,
        resolvedTime: new Date(),
        claimant: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      isResolved: true,
      resolvedTime: new Date(),
    },
  });
};

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

  if (user.claimedTicket?.id !== ticket.id && user.admin === false) {
    res.send({});
    return;
  }

  try {
    await updateTicket(user, ticket);
  } catch (e) {
    res.status(500);
    res.send({});
    return;
  }

  res.status(200);
  res.send({ ticket });
}
