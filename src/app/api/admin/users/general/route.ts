import { prisma } from "@/app/services/prisma";
import { assertAdminKey, buildCommonWhere, parsePaging, userSelect } from "../_utils";
import type { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const {
    page = 0,
    secret_key,
    onlyPaid = false,
    search,
    dateFrom,
    dateTo,
    uf,
    city,
  } = body as {
    page?: number;
    secret_key?: string;
    onlyPaid?: boolean;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    uf?: string;
    city?: string;
  };

  if (!secret_key) {
    return Response.json({ error: "secret_key é obrigatório." }, { status: 400 });
  }

  const authErr = assertAdminKey(secret_key);
  if (authErr) return authErr;

  try {
    const { take, skip, currentPage } = parsePaging(page);

    const commonWhere = buildCommonWhere({ search, dateFrom, dateTo, uf, city });

    const where: Prisma.UserWhereInput = {
      ...commonWhere,
      ...(onlyPaid ? { currentPayment: true } : {}),
    };

    const [totalItems, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / take);

    return Response.json({ users, totalItems, totalPages, currentPage });
  } catch (e) {
    return Response.json({ error: "Erro ao buscar usuários." }, { status: 500 });
  }
}