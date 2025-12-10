import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import prisma from '../../../lib/prisma';
import { Ticket } from '@/generated/prisma/client';
import { getToken } from 'next-auth/jwt';
import { isMentor } from '@/lib/helpers/permission-helper';

/*
 * POST Request: Unclaims ticket
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ticket: Nullable<Ticket> }>
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
  await prisma.ticket.update({
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
  });

  res.status(200);
  res.send({ ticket: ticket });
}
