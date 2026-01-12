import { prisma } from "@/app/services/prisma";
import type { Prisma } from "@prisma/client";

export function assertAdminKey(secret_key: string) {
  const secret = process.env.NEXT_PUBLIC_ADMIN_KEY;
  if (!secret || secret !== secret_key) {
    return Response.json({ error: "Chave de Administrador Incorreta." }, { status: 400 });
  }
  return null;
}

export function parsePaging(page: unknown, takeDefault = 10) {
  const take = takeDefault;
  const pageNumber = typeof page === "number" ? page : Number(page ?? 0);
  const safePage = Number.isFinite(pageNumber) && pageNumber >= 0 ? pageNumber : 0;
  const skip = take * safePage;
  return { take, skip, currentPage: safePage };
}

export function buildCommonWhere(input: {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  uf?: string;
  city?: string;
}): Prisma.UserWhereInput {
  const { search, dateFrom, dateTo, uf, city } = input;

  const where: Prisma.UserWhereInput = {};

  // Busca textual
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { cpf: { contains: q } },
      { phone: { contains: q } },
      { customerId: { contains: q } },
    ];
  }

  // Período por createdAt
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) (where.createdAt as any).gte = new Date(dateFrom);
    if (dateTo) (where.createdAt as any).lte = new Date(dateTo);
  }

  // Filtro por endereço
  if (uf || city) {
    where.addresses = {
      some: {
        ...(uf ? { uf: { equals: uf.trim() } } : {}),
        ...(city ? { city: { contains: city.trim() } } : {}),
      },
    };
  }

  return where;
}

export const userSelect = {
  id: true,
  birthDate: true,
  cpf: true,
  name: true,
  email: true,
  phone: true,
  createdAt: true,
  currentPayment: true,
  customerId: true,
  renovacao: true,
  course: true,
  discount: true,
  instituition: true,
  addresses: true,
};