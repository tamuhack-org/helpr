import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

/*
 * GET Request: Returns if the user is an admin
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ isMentor: boolean }>
) {
  const query = req.query;
  const { email } = query;

  const user = await prisma.user.findUnique({
    where: {
      email: email as string,
    },
  });

  res.status(200);
  res.send({ isMentor: user?.mentor || false });
}
