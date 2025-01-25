import { UserWithRoles } from '@/components/common/types';
import { EventRoles } from '@prisma/client';
import { getActiveEvent } from '../eventHelper';

export const isMentor = async (user: UserWithRoles) => {
  const activeEvent = await getActiveEvent();

  if (!activeEvent) {
    return user.mentor ?? false;
  }

  const activerole = user.roles?.find(
    (role: EventRoles) => role.eventId === activeEvent.id
  );

  return activerole?.mentor ?? false;
};
