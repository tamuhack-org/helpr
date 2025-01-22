import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import { getToken, JWT } from 'next-auth/jwt';

import prisma from '../../../lib/prisma';
import { UserWithTicket } from '../../../components/common/types';
/*
 * GET Request: Returns current user
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ user: any }>
) {
  console.log('HI');
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
  });

  const attachedTicket = await prisma.ticket.findFirst({
    where: {
      authorId: user?.id,
      isResolved: false,
    },
    include: {
      claimant: true,
    },
  });

  res.status(200);
  res.send({ user: { ...user, ticket: attachedTicket } });
}
