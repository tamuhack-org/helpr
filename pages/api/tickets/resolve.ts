import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../../lib/prisma';
import { getToken } from 'next-auth/jwt';
import { Ticket } from '@prisma/client';
import { UserWithTicketClaimant } from '../../../components/common/types';

//If the claimed ticket is resolved by an admin that did not claim the ticket, make the admin the claimant
//Probably better than leaving the claimant null or assigning it to the previous claimant
const getUpdatePayload = (user: UserWithTicketClaimant, ticket: Ticket) => {
  const isClaimant = user.id === ticket.claimantId;

  const adminResolve = {
    where: { id: ticket.id },
    data: {
      isResolved: true,
      resolvedTime: new Date(),
    },
    claimant: {
      connect: {
        id: user.id,
      },
    },
  };

  const mentorResolve = {
    where: { id: ticket.id },
    data: {
      isResolved: true,
      resolvedTime: new Date(),
    },
  };

  if (!isClaimant) {
    return adminResolve;
  }

  return mentorResolve;
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
  });

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
    include: { claimant: true },
  });

  if (!user || !ticket || (!user.admin && !user.mentor)) {
    res.status(401);
    res.send({});
    return;
  }

  if (
    ticket.claimantId &&
    user.id !== ticket.claimantId &&
    user.admin === false
  ) {
    res.status(401);
    res.send({});
    return;
  }

  const updatePayload = getUpdatePayload(user, ticket);
  await prisma.ticket.update(updatePayload);

  res.status(200);
  res.send({ ticket });
}
