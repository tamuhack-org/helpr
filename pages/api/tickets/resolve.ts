import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../../lib/prisma';
import { getToken } from 'next-auth/jwt';
import { Ticket } from '@/generated/prisma/client';
import { UserWithTicketClaimant } from '../../../components/common/types';
import { isMentor } from '@/lib/helpers/permission-helper';
import { BuzzCode, getAuthenticatedUserEmail } from '@/lib/auth';
import { notifyBuzz } from '@/lib/notifyBuzz';

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
    //buzz needs
    include: {
      author: true,
      claimant: true
    }
  };

  const mentorResolve = {
    where: { id: ticket.id },
    data: {
      isResolved: true,
      resolvedTime: new Date(),
    },
    //buzz needs
    include: {
      author: true,
      claimant: true
    }
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
  const { ticketId } = req.body;
  const authResult = await getAuthenticatedUserEmail(req);
  if (authResult.status != 200) {
    res.status(authResult.status);
    res.send({
      ticket: null,
      code: authResult.code
    })
    return;
  }

  const email = authResult.email
  if (!email) {
    res.status(500);
    res.send({
      ticket: null,
    })
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email
    },
    include: {
      roles: true,
    },
  });

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
    include: { claimant: true },
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

  if (
    !ticket.claimantId ||
    user.id !== ticket.claimantId
  ) {
    res.status(401);
    res.send({ ticket: null, code: BuzzCode.TICKET_MISMATCH });
    return;
  }

  const updatePayload = getUpdatePayload(user, ticket);
  const updatedTicket = await prisma.ticket.update(updatePayload);

  notifyBuzz(updatedTicket, "update-ticket")

  res.status(200);
  res.send({ ticket: updatedTicket });
}
