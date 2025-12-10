import { UserWithRoles } from '@/components/common/types';
import { EventRoles } from '@/generated/prisma/client';
import { getActiveEvent } from '../eventHelper';

export const isMentor = async (user: UserWithRoles) => {
  const activeEvent = await getActiveEvent();

  //If there is no active event, then there cannot be non-admin mentors
  if (!activeEvent) {
    return user.admin;
  }

  const activerole = user.roles?.find(
    (role: EventRoles) => role.eventId === activeEvent.id
  );

  return activerole?.mentor ?? false;
};
