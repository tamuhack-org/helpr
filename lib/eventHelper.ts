import prisma from './prisma';

export const getActiveEvent = async () => {
  const events = await prisma.event.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdTime: 'desc',
    },
  });

  if (!events?.length) {
    return null;
  }

  return events[0];
};
