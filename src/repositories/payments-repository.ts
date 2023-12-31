import { prisma } from '@/config';
import { PaymentParams } from '@/protocols';

async function findPaymentByTicketId(ticketId: number) {
  const result = await prisma.payment.findFirst({
    where: { ticketId },
  });
  return result;
}

function createPayment(ticketId: number, params: PaymentParams) {
  const result = prisma.payment.create({
    data: {
      ticketId,
      ...params,
    },
  });

  return result;
}

export const paymentsRepository = {
  findPaymentByTicketId,
  createPayment,
};
