import type { NextApiRequest, NextApiResponse } from 'next'
import type { Message } from '../../../components/common/types';
import type { Ticket, Tickets } from '../../../components/tickets/types'

const sampleTicket1: Ticket = {
  time_opened: "1",
  description: "Help Me",
  location: "MSC",
  contact: "Phone Number",
  author: "email",
}

const sampleTicket2: Ticket = {
  time_opened: "2",
  description: "Help Us",
  location: "MSC",
  contact: "Phone Number",
  author: "email",
}

/*
 * GET Request: Returns claimed & unresolved tickets 
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tickets | Message>
) {

  if (req.method !== 'GET') {
    res.status(405).send({ message: 'Only GET requests allowed' })
    return
  }
  
  res.status(200).json({ data: [sampleTicket1, sampleTicket2] });
}
