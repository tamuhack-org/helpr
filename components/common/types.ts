import { EventRoles, Ticket } from '@/generated/prisma/client';
import { User } from '@/generated/prisma/client';
import { Nullable } from '../../lib/common';

export interface UserWithTicketClaimant extends User {
  ticket?: Nullable<TicketWithClaimant>;
}

export interface UserWithRoles extends User {
  roles: EventRoles[];
}

export interface TicketWithClaimant extends Ticket {
  claimant?: User;
}
