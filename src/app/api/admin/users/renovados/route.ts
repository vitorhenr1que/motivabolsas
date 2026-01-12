import { prisma } from "@/app/services/prisma";
import { assertAdminKey, buildCommonWhere, parsePaging, userSelect } from "../_utils";
import type { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { page = 0, secret_key, search, dateFrom, dateTo, uf, city } = body;

  if (!secret_key) return Response.json({ error: "secret_key é obrigatório." }, { status: 400 });
  const authErr = assertAdminKey(secret_key);
  if (authErr) return authErr;

  try {
    const { take, skip, currentPage } = parsePaging(page);
    const commonWhere = buildCommonWhere({ search, dateFrom, dateTo, uf, city });

    const where: Prisma.UserWhereInput = {
      ...commonWhere,
      currentPayment: true,
      renovacao: { gt: 1 },
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

    return Response.json({
      users,
      totalItems,
      totalPages: Math.ceil(totalItems / take),
      currentPage,
    });
  } catch {
    return Response.json({ error: "Erro ao buscar renovados." }, { status: 500 });
  }
}