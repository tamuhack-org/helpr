import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import prisma from '../../../lib/prisma';
import { Ticket } from '@/generated/prisma/client';
import { getToken } from 'next-auth/jwt';
import { isMentor } from '@/lib/helpers/permission-helper';
import verifyHMAC from '@/lib/verifyHMAC';

enum BuzzCode {
  DiscordNotLinked = "DISCORD_NOT_LINKED"
}

/*
 * POST Request: Claims Ticket
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ticket: Nullable<Ticket>; code?: BuzzCode; error?: string }>
) {
  const { ticketId } = req.body;

  async function getAuthenticatedUserEmail() {
    //check browser for token 
    const token = await getToken({ req });
    if (token?.email) return token.email;

    //TODO: hella redundancy here with db calls
    const { discordId } = req.body;
    if(!discordId){
      res.status(400);
      res.send({ ticket: null });
      return null;
    }

    const user = await prisma.user.findFirst({
      where: {
        discordId: discordId,
      },
    });
    if(!user){
      //user not found
      res.status(401);
      res.send({ ticket: null, code: BuzzCode.DiscordNotLinked });
      return null;
    }

    const reqHmacSignature = req.headers['x-authorization-content-hmac'];
    const reqHmacTimestamp = req.headers['x-authorization-timestamp'];
    const hmacMatch = verifyHMAC(req.body, {signature: reqHmacSignature as string, timestamp: reqHmacTimestamp as string});
    if(!hmacMatch){
      res.status(400);
      res.send({ ticket: null });
      return null;
    }

    return user.email;
  }

  const email = await getAuthenticatedUserEmail();

  if (!email) {
    res.status(400);
    res.send({ ticket: null });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      claimedTickets: true,
      roles: true,
    },
  });

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!user || !ticket) {
    res.status(400);
    res.send({ ticket: null });
    return;
  }

  const hasMentorRole = await isMentor(user);

  if (!user.admin && !hasMentorRole) {
    res.status(401);
    res.send({ ticket: null });
    return;
  }

  const isClaimed = user.claimedTickets?.some(
    (ticket: Ticket) => !ticket.isResolved
  );

  if (isClaimed || ticket.claimantId) {
    //TODO this should not return a 200, this is not a success
    res.status(200);
    res.send({ ticket: null, error: 'You already have a ticket claimed' });
    return;
  }

  await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      claimedTime: new Date(),
      isClaimed: true,
      claimant: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  res.status(200);
  res.send({ ticket: ticket });
}
