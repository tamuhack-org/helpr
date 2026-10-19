import { Ticket } from '@/generated/prisma/client';
import createHMAC from './createHMAC';
import axios from 'axios';

export async function notifyBuzz(ticket: Ticket, endpoint: string) {
  // TODO: make BUZZ_URL part of some kinda config in settings
  const buzzUrl = process.env.BUZZ_URL;
  if (!buzzUrl) return;

  const buzzPingPath = `${buzzUrl}/helpr/${endpoint}`;
  const hmacDetails = createHMAC(ticket);
  if (!hmacDetails) {
    console.error("HMAC creation failed");
    return;
  }

  // TODO: Make this part of some kinda interface and used everywhere part of HMAC
  const headers = {
    'x-authorization-content-hmac': hmacDetails.signature,
    'x-authorization-timestamp': hmacDetails.timestamp,
  };

  try {
    const buzzResponse = await axios.post(buzzPingPath, ticket, { headers, timeout: 5000 });
    return buzzResponse;
  } catch (err) {
    console.error(`Failed to post to ${endpoint}: `, err);
    return;
  }
}

