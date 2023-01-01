import type { NextApiRequest, NextApiResponse } from 'next';

import { Nullable } from '../../../lib/common';
import prisma from '../../../lib/prisma';
import { getToken, JWT } from 'next-auth/jwt';

/*
 * POST Request: Deletes ticket and disassociates it with user.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token: Nullable<JWT> = await getToken({ req });
  const ticketId = req.body.ticketId;

  if (!token || !token.email) {
    res.status(401);
    res.send({ ticket: null });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: token?.email || '',
    },
  });

  if (user?.ticketId != ticketId && !user?.admin) {
    res.status(401);
    return;
  }

  await prisma.user.update({
    where: {
      email: user?.email || undefined,
    },
    data: {
      ticketId: null,
    },
  });

  await prisma.ticket.delete({
    where: {
      id: ticketId,
    },
  });

  res.status(200);
  res.send({});
}
