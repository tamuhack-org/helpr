import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../../lib/prisma';
import { Ticket } from '@/generated/prisma/client';
import { getToken } from 'next-auth/jwt';
import {
  maxPhoneLength,
  maxIssueLength,
  maxLocationLength,
  Nullable,
} from '../../../lib/common';
import { getActiveEvent } from '../../../lib/eventHelper';

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

  //This code is purely for testing!
  console.log("TICKET SUBMITTED HERE!");
  const discordUrl = `${process.env.DISCORD_HTTP_ENDPOINT}/helpr/ping-mentor`;
  console.log(discordUrl);
  const data = {
    "name": user.name,
    "email": token.email,
    "location": location,
    "phone_number": contact,
    "issue": issue
  }
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  }
  fetch(discordUrl, options).then(() => console.log("Yay!")).catch((err) => console.log(err));
  //End teseting

  res.status(200).send({ ticket: ticket });
}
