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

async function getActivities(userId: number) {
  await validateUserBooking(userId);

  const activities = await activitiesRepository.findActivities();
  if (activities.length === 0) throw notFoundError();

  return activities;
}

async function getActivitiesByUser(userId: number) {
    const activities = await activitiesRepository.getActivitiesByUser(userId);
    if (activities.length === 0) throw notFoundError();
  
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

  const userActivities = await getActivitiesByUser(userId);

  const conflictActivity = userActivities.find(userActivity =>
    userActivity.Activity.startsAt <= activity.endsAt && userActivity.Activity.endsAt >= activity.startsAt
  );
  if (conflictActivity) {
    throw conflictError('Atividades no mesmo horário');
  }

  const reservation = await activitiesRepository.reserveActivity(userId, activityId);

  return reservation.id;
}

export const activitiesService = {
  getActivities,
  reserveActivity,
};
