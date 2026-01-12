import { prisma } from "@/app/services/prisma";
import { assertAdminKey, buildCommonWhere, parsePaging, userSelect } from "../_utils";
import type { Prisma } from "@prisma/client";

function calcNovosPendentesWindow() {
  const now = new Date();

  // hoje - 2 dias
  const end = new Date(now);
  end.setDate(end.getDate() - 2);

  // hoje - 2 meses
  const start = new Date(now);
  start.setMonth(start.getMonth() - 2);

  return { start, end };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { page = 0, secret_key, search, uf, city } = body;

  if (!secret_key) return Response.json({ error: "secret_key é obrigatório." }, { status: 400 });
  const authErr = assertAdminKey(secret_key);
  if (authErr) return authErr;

  try {
    const { take, skip, currentPage } = parsePaging(page);

    // Para "Novos pendentes" o período é FIXO pela regra do dashboard
    const { start, end } = calcNovosPendentesWindow();

    // Reaproveita busca e uf/city, mas NÃO usa dateFrom/dateTo externos para não quebrar a regra
    const commonWhere = buildCommonWhere({ search, uf, city });

    const where: Prisma.UserWhereInput = {
      ...commonWhere,
      currentPayment: false,
      createdAt: { gte: start, lte: end },
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
      window: { start, end }, // útil pra exibir no dashboard
    });
  } catch {
    return Response.json({ error: "Erro ao buscar novos pendentes." }, { status: 500 });
  }
}