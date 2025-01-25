import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import prisma from '../../../lib/prisma';
import { Ticket } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { getActiveEvent } from '@/lib/eventHelper';
import { isMentor } from '@/lib/helpers/permission-helper';

/*
 * POST Request: Claims Ticket
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ticket: Nullable<Ticket>; error?: string }>
) {
  const token = await getToken({ req });
  const { ticketId } = req.body;

  if (!token) {
    res.status(401);
    res.send({ ticket: null });
    return;
  }

  const activeEvent = await getActiveEvent();

  if (!activeEvent) {
    res.status(500);
    res.send({ ticket: null });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: token?.email || '',
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
