import { prisma } from '@/config';

async function findActivities() {
  return prisma.activity.findMany()
}

async function getActivityById(activityId: number) {
  return prisma.activity.findFirst({
    where: {
      id: activityId
    },
    include: {Reservation: true},
  });
}

async function getActivitiesByUser(userId: number, date: Date) {
  const reservations = await prisma.reservation.findMany({
    where: {
      userId: userId
    },
    include: {Activity: true},
  });

  const filteredReservations = reservations.filter((reservation) => {
    const activity = reservation.Activity;
    return activity.date.toDateString() === date.toDateString();
  });

  return filteredReservations;
}

async function reserveActivity(userId: number, activityId: number) {
  return prisma.reservation.create({
    data: {userId, activityId},
  });
}


export const activitiesRepository = {
  findActivities,
  getActivityById,
  getActivitiesByUser,
  reserveActivity
}