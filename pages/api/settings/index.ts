import { Settings } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Nullable } from '../../../lib/common';

import prisma from '../../../lib/prisma';

/*
 * GET Request: Returns app settings
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ settings: Nullable<Settings[]> }>
) {
  if (req.method !== 'GET') {
    return;
  }

  const settings = await prisma.settings.findMany();

  res.status(200).send({ settings });
}
