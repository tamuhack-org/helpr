import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import { getToken, JWT } from 'next-auth/jwt';

import prisma from '../../../lib/prisma';

/*
 * GET Request: Returns ranked list of users
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token: Nullable<JWT> = await getToken({ req });

  if (!token) {
    res.status(401);
    res.send({ users: [] });
    return;
  }

  const resolvedTickets = await prisma.ticket.findMany({
    where: {
      isResolved: true,
    },
    include: { claimant: true },
    orderBy: {
      publishTime: 'desc',
    },
  });

  const frequency: {
    [key: string]: { email: string; frequency: number; name: string };
  } = {};

  resolvedTickets.forEach((ticket) => {
    if (frequency[String(ticket.claimantId)]) {
      frequency[String(ticket.claimantId)].frequency += 1;
    } else {
      const claimant = ticket.claimant;
      frequency[String(ticket.claimantId)] = {
        email: claimant?.email ?? '',
        name: claimant?.name ?? '',
        frequency: 1,
      };
    }
  });

  res.status(200);
  res.send(frequency);
}
