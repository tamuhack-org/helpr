import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import { getToken, JWT } from 'next-auth/jwt';

import prisma from '../../../lib/prisma';
import { isMentor } from '@/lib/helpers/permission-helper';

/*
 * GET Request: Returns current user
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token: Nullable<JWT> = await getToken({ req });

  if (!token) {
    res.status(401);
    res.send({ user: null });
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

  if (!user) {
    res.status(401);
    res.send({ user: null });
    return;
  }

  const hasMentorRole = await isMentor(user);

  const attachedTicket = await prisma.ticket.findFirst({
    where: {
      authorId: user?.id,
      isResolved: false,
    },
    include: {
      claimant: true,
    },
  });

  const updatedUser = {
    ...user,
    mentor: hasMentorRole,
    ticket: attachedTicket,
  };

  res.status(200);
  res.send({ user: updatedUser });
}
