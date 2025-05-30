import type { NextApiRequest, NextApiResponse } from 'next';
import { removeStopwords } from 'stopword';

import prisma from '../../../../lib/prisma';

/*
 * GET Request: Returns frequency dict for ticket topics
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return;
  }

  const eventId = req.query.eventId;

  const totalTickets = await prisma.ticket.findMany({
    where: {
      eventId: eventId as string,
    },
    orderBy: {
      publishTime: 'desc',
    },
  });

  const frequencies: { [token: string]: number } = {};

  totalTickets.forEach((ticket) => {
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
