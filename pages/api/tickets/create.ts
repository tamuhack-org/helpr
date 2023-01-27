import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../../lib/prisma';
import { Ticket } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

/*
 * POST Request: Creates new ticket and assigns it to user
 */

type ResponseData = {
  ticket?: Ticket;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const token = await getToken({ req });
  const { issue, location, contact } = req.body;
  const maxIssueLength = 80;
  const maxLocationLength = 40;
  const maxContactLength = 20;

  if (!token) {
    res.status(401);
    res.send({});
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: token?.email || '',
    },
    include: {
      ticket: true,
    },
  });

  if (!user || user?.ticket) {
    res.status(409);
    return;
  }

  if (!issue || !location || !contact) {
    res.status(405).json({ error: 'Missing fields' });
    return;
  }

  if (issue.length > maxIssueLength) {
    res
      .status(400)
      .json({ error: 'Issue too long. Max ' + maxIssueLength + ' characters' });
    return;
  }

  if (location.length > maxLocationLength) {
    res
      .status(400)
      .json({
        error: 'Location too long. Max' + maxLocationLength + ' characters',
      });
    return;
  }

  if (contact.length > maxContactLength) {
    res
      .status(400)
      .json({
        error: 'Contact too long. Max ' + maxContactLength + ' characters',
      });
    return;
  }

  const ticket = await prisma.ticket.create({
    data: {
      authorName: user.name,
      issue: issue,
      location: location,
      contact: contact,
      author: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  res.status(200).send({ ticket: ticket });
}
