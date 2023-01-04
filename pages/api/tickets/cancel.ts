import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../../lib/prisma';
import { getToken } from 'next-auth/jwt';

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

  await prisma.ticket.delete({
    where: {
      id: ticketId,
    },
  });

  res.status(200);
  res.send({});
}
