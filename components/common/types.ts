import { Ticket } from '@prisma/client';
import { User } from '@prisma/client';
import { Nullable } from '../../lib/common';

export interface UserWithTicketClaimant extends User {
  ticket?: Nullable<TicketWithClaimant>;
}

export interface TicketWithClaimant extends Ticket {
  claimant?: User;
}

export interface RoleData {
  isAdmin: boolean;
  isMentor: boolean;
}
