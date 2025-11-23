import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../../lib/prisma';
import { getToken } from 'next-auth/jwt';
import { ticketEvents, TICKET_EVENTS } from '../../../lib/ticketEvents';

/*
 * POST Request: Deletes ticket and disassociates it with user.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  const { ticketId } = req.body;

  if (!token) {
    res.status(401);
    res.send({ ticket: null });
    return res.send({});
  }

  const ticketToDelete = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { claimant: true },
  });

  await prisma.ticket.delete({
    where: {
      id: ticketId,
    },
  });

  // Emit ticket cancelled event
  ticketEvents.emit(TICKET_EVENTS.CANCELLED, { id: ticketId, ...ticketToDelete });

  res.status(200);
  res.send({});
}
