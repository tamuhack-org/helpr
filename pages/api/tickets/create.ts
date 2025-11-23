import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../../lib/prisma';
import { Ticket } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import {
  maxPhoneLength,
  maxIssueLength,
  maxLocationLength,
  Nullable,
} from '../../../lib/common';
import { getActiveEvent } from '../../../lib/eventHelper';
import { ticketEvents, TICKET_EVENTS, getActiveConnections } from '../../../lib/ticketEvents';

/*
 * POST Request: Creates new ticket and assigns it to user
 */

type ResponseData = {
  ticket?: Nullable<Ticket>;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const token = await getToken({ req });
  const { issue, location, contact } = req.body;

  if (!token) {
    res.status(401);
    res.send({});
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: token?.email || '',
    },
  });

  const existingTicket = await prisma.ticket.findFirst({
    where: {
      authorId: user?.id,
      isResolved: false,
    },
  });

  if (!user || existingTicket) {
    res.status(409);
    res.send({});
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
    res.status(400).json({
      error: 'Location too long. Max' + maxLocationLength + ' characters',
    });
    return;
  }

  if (contact.length > maxPhoneLength) {
    res.status(400).json({
      error: 'Contact too long. Max ' + maxPhoneLength + ' characters',
    });
    return;
  }

  const activeEvent = await getActiveEvent();
  const ticket = await prisma.ticket.create({
    data: {
      authorName: user.name,
      issue,
      location,
      contact,
      author: {
        connect: {
          id: user.id,
        },
      },
      ...(activeEvent && { event: { connect: { id: activeEvent.id } } }),
    },
  });

  // Emit ticket created event
  ticketEvents.emit(TICKET_EVENTS.CREATED, ticket);

  res.status(200).send({ ticket: ticket });
}
