import type { NextApiRequest, NextApiResponse } from 'next';
import { removeStopwords } from 'stopword';

import prisma from '../../../../lib/prisma';

/*
 * GET Request: Returns frequency dict for ticket topics for specific mentor
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return;
  }
  const { email } = req.query;
  const eventId = req.query.eventId;

  const resolvedTickets = await prisma.ticket.findMany({
    where: {
      claimant: {
        email: email as string,
      },
      eventId: eventId as string,
      isResolved: true,
    },
    include: {
      claimant: true,
    },
    orderBy: {
      publishTime: 'desc',
    },
  });

  const frequencies: { [token: string]: number } = {};

  resolvedTickets.forEach((ticket) => {
    const issueTokens = ticket.issue.toLowerCase().split(' ');
    const relevantTokens = removeStopwords(issueTokens);

    relevantTokens.forEach((token) => {
      if (frequencies[token]) {
        frequencies[token] += 1;
      } else {
        frequencies[token] = 1;
      }
    });
  });

  res.status(200).send(frequencies);
}
