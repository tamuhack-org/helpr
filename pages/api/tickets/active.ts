import type { NextApiRequest, NextApiResponse } from 'next';
import { getActiveEvent } from '../../../lib/eventHelper';
import {
  ticketEvents,
  incrementConnections,
  decrementConnections,
} from '../../../lib/ticketEvents';

import prisma from '../../../lib/prisma';

/*
 * GET Request: Returns active tickets via Server-Sent Events
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return;
  }

  incrementConnections();

  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  // Send initial heartbeat
  res.write(': heartbeat\n\n');
  (res as any).flush();

  const sendTickets = async () => {
    try {
      const activeEvent = await getActiveEvent();

      const tickets = await prisma.ticket.findMany({
        where: {
          isResolved: false,
          eventId: activeEvent?.id,
        },
        orderBy: {
          publishTime: 'desc',
        },
        include: {
          claimant: true,
        },
      });

      const message = `data: ${JSON.stringify({ tickets })}\n\n`;
      res.write(message);
      (res as any).flush();
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.write(
        `data: ${JSON.stringify({ error: 'Failed to fetch tickets' })}\n\n`
      );
      (res as any).flush();
    }
  };

  // Send initial data
  await sendTickets();

  // Listen for ticket events
  const handleTicketChange = (eventType: string) => {
    return (data: any) => {
      sendTickets();
    };
  };

  ticketEvents.on('ticket:created', handleTicketChange('ticket:created'));
  ticketEvents.on('ticket:updated', handleTicketChange('ticket:updated'));
  ticketEvents.on('ticket:claimed', handleTicketChange('ticket:claimed'));
  ticketEvents.on('ticket:unclaimed', handleTicketChange('ticket:unclaimed'));
  ticketEvents.on('ticket:resolved', handleTicketChange('ticket:resolved'));
  ticketEvents.on('ticket:cancelled', handleTicketChange('ticket:cancelled'));


  // Keep connection alive with heartbeat
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
    (res as any).flush();
  }, 30000);

  // Clean up on client disconnect
  const cleanup = () => {
    decrementConnections();
    clearInterval(heartbeat);
    ticketEvents.removeListener(
      'ticket:created',
      handleTicketChange('ticket:created')
    );
    ticketEvents.removeListener(
      'ticket:updated',
      handleTicketChange('ticket:updated')
    );
    ticketEvents.removeListener(
      'ticket:claimed',
      handleTicketChange('ticket:claimed')
    );
    ticketEvents.removeListener(
      'ticket:unclaimed',
      handleTicketChange('ticket:unclaimed')
    );
    ticketEvents.removeListener(
      'ticket:resolved',
      handleTicketChange('ticket:resolved')
    );
    ticketEvents.removeListener(
      'ticket:cancelled',
      handleTicketChange('ticket:cancelled')
    );
  };

  req.on('close', cleanup);
  req.on('error', cleanup);
}
