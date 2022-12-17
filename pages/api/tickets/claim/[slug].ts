import type { NextApiRequest, NextApiResponse } from 'next'
import type { Ticket } from '../../../../components/tickets/types'
import type { Message } from '../../../../components/common/types'

/*
 * POST Request: Claims ticket
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Message>
) {

  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
    return
  }

  const { ticketID } = req.query;
  res.status(200);
}
