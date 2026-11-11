import { prisma } from "../services/prisma";
import { getCapturePeriod } from "./capture-period";

export async function registerInterPayment(codigoSolicitacao: string, cpf: string) {
  if (!codigoSolicitacao || !cpf) {
    throw new Error("Pagamento sem codigoSolicitacao ou CPF.");
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.paymentPeriod.findUnique({ where: { codigoSolicitacao } });
    if (existing) return null;

    const period = await getCapturePeriod(tx);
    const inserted = await tx.paymentPeriod.createMany({
      data: { codigoSolicitacao, period },
      skipDuplicates: true,
    });
    // Reenvios do mesmo evento preservam o período e não contam outra renovação.
    if (inserted.count === 0) return null;

    await tx.user.updateMany({
      where: { cpf, renovacao: null },
      data: { renovacao: 0 },
    });

    return tx.user.update({
      where: { cpf },
      data: {
        currentPayment: true,
        firstPayment: true,
        renovacao: { increment: 1 },
      },
      select: {
        id: true,
        phone: true,
        name: true,
        course: true,
        instituition: true,
        cpf: true,
        discount: true,
        renovacao: true,
        createdAt: true,
        addresses: { select: { city: true } },
      },
    });
  });
}
