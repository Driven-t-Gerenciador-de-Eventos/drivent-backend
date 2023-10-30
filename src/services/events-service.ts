import { Event } from '@prisma/client';
import dayjs from 'dayjs';
import { notFoundError } from '@/errors';
import { eventRepository } from '@/repositories';
import { exclude } from '@/utils/prisma-utils';
import redis, { EXP } from '@/config/redis';

async function getFirstEvent(): Promise<GetFirstEventResult> {
  const key = 'FirstEvent';
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  } else {
  const event = await eventRepository.findFirst();
  if (!event) throw notFoundError();

  await redis.setEx(key, EXP, JSON.stringify(exclude(event, 'createdAt', 'updatedAt')));
  return exclude(event, 'createdAt', 'updatedAt');
  }
}

export type GetFirstEventResult = Omit<Event, 'createdAt' | 'updatedAt'>;

async function isCurrentEventActive(): Promise<boolean> {
  const key = 'isCurrentEventActive';
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  } else {
    const event = await eventRepository.findFirst();
    if (!event) return false;
    const now = dayjs();
    const eventStartsAt = dayjs(event.startsAt);
    const eventEndsAt = dayjs(event.endsAt);
    const isActive = now.isAfter(eventStartsAt) && now.isBefore(eventEndsAt);

    await redis.setEx(key, EXP, JSON.stringify(isActive));
    return isActive;
  }
}

export const eventsService = {
  getFirstEvent,
  isCurrentEventActive,
};
