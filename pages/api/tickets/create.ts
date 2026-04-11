import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

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
import createHMAC from '@/lib/createHMAC';

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

  async function discordPing(userName: string, email: string, ticketId: string){
    const discordUrl = `${process.env.DISCORD_HTTP_ENDPOINT}/helpr/ping-mentor`;
    const data = {
      "name": userName,
      "email": email,
      "location": location,
      "phone_number": contact,
      "issue": issue,
      "id": ticketId,
    }

    const hmacDetails = createHMAC(data);
    if(!hmacDetails){
      res.status(500);
      res.send({error: "Failed to create HMAC signature"})
    }

    const headers = {
      'X-Authorization-Content-HMAC': hmacDetails?.signature,
      'X-Authorization-Timestamp': hmacDetails?.timestamp,
    };

    await axios
    .post(discordUrl, data, {headers: headers})
    .then(() => console.log("Mentors pinged on discord!"))
    .catch((err) => console.log(err))
  }

  const token = await getToken({ req });
  const { issue, location, contact } = req.body;

  if (!token) {
    res.status(401);
    res.send({});
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: token.email || '',
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

  discordPing(user.name, token.email!, ticket.id);

  res.status(200).send({ ticket: ticket });
}
