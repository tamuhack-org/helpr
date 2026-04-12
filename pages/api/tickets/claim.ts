import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import prisma from '../../../lib/prisma';
import { Ticket } from '@/generated/prisma/client';
import { getToken } from 'next-auth/jwt';
import { isMentor } from '@/lib/helpers/permission-helper';

/*
 * POST Request: Claims Ticket
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ticket: Nullable<Ticket>; error?: string }>
) {
  const { ticketId } = req.body;

  async function getAuthenticatedUserEmail() {
    //check browser for token 
    const token = await getToken({ req });
    if (token?.email) return token.email;

    //TODO: hella redundancy here with db calls
    //TODO: add hmac check
    const { discordId } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        discordId: discordId || '',
      },
    });

    //TODO: redirect if discordId hasn't been linked
    if(!user){
      res.status(400);
      res.send({ ticket: null });
      return null;
    }

    return user.email;
  }

  const email = await getAuthenticatedUserEmail();

  if (!email) {
    res.status(401);
    res.send({ ticket: null });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email || '',
    },
    include: {
      claimedTickets: true,
      roles: true,
    },
  });

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!user || !ticket) {
    res.status(400);
    res.send({ ticket: null });
    return;
  }

  const hasMentorRole = await isMentor(user);

  if (!user.admin && !hasMentorRole) {
    res.status(401);
    res.send({ ticket: null });
    return;
  }

  const isClaimed = user.claimedTickets?.some(
    (ticket: Ticket) => !ticket.isResolved
  );

  if (isClaimed || ticket.claimantId) {
    res.status(200);
    res.send({ ticket: null, error: 'You already have a ticket claimed' });
    return;
  }

  await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      claimedTime: new Date(),
      isClaimed: true,
      claimant: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  res.status(200);
  res.send({ ticket: ticket });
}
