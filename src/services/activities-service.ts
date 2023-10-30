import { TicketStatus } from '@prisma/client';
import { conflictError, invalidDataError, notFoundError, unauthorizedError } from '@/errors';
import { activitiesRepository, enrollmentRepository, ticketsRepository } from '@/repositories';

async function validateUserBooking(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  const type = ticket.TicketType;

  if (ticket.status === TicketStatus.RESERVED || type.isRemote) {
    throw unauthorizedError();
  }
}

function formatarData(data: string) {
  const dataFormatada = new Date(data).toLocaleDateString('pt-BR', {weekday: 'long', day: '2-digit', month: '2-digit'});
  return dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
}


async function getActivities(userId: number) {
  await validateUserBooking(userId);

  const activities = await activitiesRepository.findActivities(userId);
  if (activities.length === 0) throw notFoundError();

  const activitiesWithFormattedDate = activities.map(activity => ({
    ...activity,
    formattedDate: formatarData(activity.date),
  }));

  return activitiesWithFormattedDate;
}

async function getActivitiesByUser(userId: number, date: Date) {
    const activities = await activitiesRepository.getActivitiesByUser(userId, date);
  
    return activities;
  }

async function getActivityById(activityId: number){  
    const activity = await activitiesRepository.getActivityById(activityId);
    if (!activity) throw notFoundError();
  
    return activity;
}

async function reserveActivity(userId: number, activityId: number) {
  await validateUserBooking(userId);
  if (!activityId || isNaN(activityId)) throw invalidDataError('activityId');

  const activity = await getActivityById(activityId);
  if (activity.Reservation.length >= activity.capacity) {
    throw conflictError('Atividade sem vagas');
  }

  const userActivities = await getActivitiesByUser(userId, activity.date);

  if(userActivities){
    const conflictActivity = userActivities.find(userActivity =>
      userActivity.Activity.startsAt <= activity.endsAt && userActivity.Activity.endsAt >= activity.startsAt
    );
    console.log(conflictActivity)
    if (conflictActivity) {
      throw conflictError('Atividades no mesmo horário');
    }
  }

  const reservation = await activitiesRepository.reserveActivity(userId, activityId);
  return reservation.id;
}

export const activitiesService = {
  getActivities,
  reserveActivity,
};
