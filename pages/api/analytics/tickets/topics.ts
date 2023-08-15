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

  const resolvedTickets = await prisma.resolvedTicket.findMany({
    orderBy: {
      publishTime: 'desc',
    },
  });

  const activeTickets = await prisma.ticket.findMany({
    orderBy: {
      publishTime: 'desc',
    },
  });

  const totalTickets = activeTickets.concat(resolvedTickets);
  const frequencies: { [token: string]: number } = {};

  totalTickets.forEach((ticket) => {
    const issueTokens = ticket.issue.toLowerCase().split(' ');
    const relevantTokens = removeStopwords(issueTokens);
    console.log('Ticket', ticket.issue);

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
