import { EventEmitter } from 'events';

class TicketEventEmitter extends EventEmitter {}

export const ticketEvents = new TicketEventEmitter();

// Track active SSE connections
let activeConnections = 0;

export const incrementConnections = () => {
  activeConnections++;
};

export const decrementConnections = () => {
  activeConnections--;
};

export const getActiveConnections = () => activeConnections;

export const TICKET_EVENTS = {
  CREATED: 'ticket:created',
  UPDATED: 'ticket:updated',
  CLAIMED: 'ticket:claimed',
  UNCLAIMED: 'ticket:unclaimed',
  RESOLVED: 'ticket:resolved',
  CANCELLED: 'ticket:cancelled',
} as const;