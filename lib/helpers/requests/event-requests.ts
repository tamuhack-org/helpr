import { Event } from '@/generated/prisma/client';

const base = '/api/events/';

export const EventRequests = {
  createEvent: async (payload: Partial<Event>) => {
    return fetch(base + 'create', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  updateEvent: async (payload: Partial<Event>) => {
    return fetch(base + 'update', {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};
