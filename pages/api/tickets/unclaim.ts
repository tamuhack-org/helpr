import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import prisma from '../../../lib/prisma';
import { Ticket } from '@/generated/prisma/client';
import { getToken } from 'next-auth/jwt';
import { isMentor } from '@/lib/helpers/permission-helper';
import { BuzzCode, getAuthenticatedUserEmail } from '@/lib/auth';
import { notifyBuzz } from '@/lib/notifyBuzz';

/*
 * POST Request: Unclaims ticket
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ticket: Nullable<Ticket>, code?: BuzzCode }>
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

  if(ticket.claimantId !== user.id) {
    res.status(401);
    res.send({ticket: null, code: BuzzCode.TICKET_MISMATCH})
  }

  const updatedTicket = await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      isClaimed: false,
      claimedTime: null,
      publishTime: new Date(),
      claimant: {
        disconnect: true,
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
