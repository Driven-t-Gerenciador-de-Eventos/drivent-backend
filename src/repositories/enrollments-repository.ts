import { Enrollment } from '@prisma/client';
import { prisma } from '@/config';
import { CreateAddressParams, UpdateAddressParams } from './address-repository';

async function findWithAddressByUserId(userId: number) {
  return prisma.enrollment.findFirst({
    where: { userId },
    include: {
      Address: true,
    },
  });
}

function upsertEnrollmentWithAddress(
  userId: number,
  createdEnrollment: CreateEnrollmentParams,
  updatedEnrollment: UpdateEnrollmentParams,
  createdAddress: CreateAddressParams,
  updatedAddress: UpdateAddressParams,
) {
  return prisma.enrollment.upsert({
    where: {
      userId,
    },
    create: {...createdEnrollment, Address: {
      create: {
        ...createdAddress,
      }
    }},
    update: {...updatedEnrollment, Address: {
      upsert: {
        where: {
          enrollmentId:  userId,
        },
        create: createdAddress,
        update: updatedAddress
      }
    }}
  });
}

export type CreateEnrollmentParams = Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEnrollmentParams = Omit<CreateEnrollmentParams, 'userId'>;

export const enrollmentRepository = {
  findWithAddressByUserId,
  upsertEnrollmentWithAddress,
};
