import { prisma } from '@/config';

type Activity = {
  id: number;
  name: string;
  place: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  availableCapacity: number;
};


async function findActivities(): Promise<Activity[]> {
  return prisma.$queryRaw`
    SELECT a.*, (a.capacity - COALESCE(r."reservationCount", 0)) as "availableCapacity"
    FROM "Activity" a
    LEFT JOIN (
      SELECT "activityId", COUNT(id) as "reservationCount"
      FROM "Reservation"
      GROUP BY "activityId"
    ) r ON a.id = r."activityId";
  `;
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