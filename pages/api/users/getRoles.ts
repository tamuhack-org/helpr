import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

/*
 * GET Request: Returns a user role object
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ isAdmin: boolean; isMentor: boolean }>
) {
  const query = req.query;
  const { email } = query;

  if (!email) {
    res.status(200);
    res.send({ isAdmin: false, isMentor: false });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email as string,
    },
  });

  const isAdmin = user?.admin ?? false;
  const isMentor = user?.mentor ?? false;

  res.status(200);
  res.send({ isAdmin, isMentor });
}
