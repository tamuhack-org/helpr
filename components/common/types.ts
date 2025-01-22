import { Ticket } from '@prisma/client';
import { User } from '@prisma/client';
import { Nullable } from '../../lib/common';

export interface UserWithTicket extends User {
  ticket?: Nullable<Ticket>;
}

export interface TicketWithClaimant extends Ticket {
  claimant?: User;
}
