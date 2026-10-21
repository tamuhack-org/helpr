import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import prisma from '../../../lib/prisma';
import { Ticket } from '@/generated/prisma/client';
import { isMentor } from '@/lib/helpers/permission-helper';
import { getAuthenticatedUserEmail, BuzzCode } from '@/lib/auth';
import { notifyBuzz } from '@/lib/notifyBuzz';

/*
 * POST Request: Claims Ticket
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ticket: Nullable<Ticket>; code?: BuzzCode; error?: string, shouldShowError?: boolean }>
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
    res.status(400);
    res.send({ ticket: null });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email,
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

  //a ticket has already been claimed by this mentor
  if (isClaimed) {
    res.status(409);
    res.send({ ticket: null, error: 'You already have a ticket claimed', shouldShowError: true, code: BuzzCode.HasExistingTicket });
    return;
  }

  //this ticket has already been assigned
  if (ticket.claimantId) {
    res.status(403);
    res.send({ ticket: null, error: 'Someone has already claimed this ticket', shouldShowError: true, code: BuzzCode.AlreadyClaimedTicket });
    return;
  }

  const updatedTicket = await prisma.ticket.update({
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
    //buzz needs
    include: {
      author: true,
      claimant: true
    }
  });

  notifyBuzz(updatedTicket, "update-ticket")

  res.status(200);
  res.send({ ticket: updatedTicket });
}
