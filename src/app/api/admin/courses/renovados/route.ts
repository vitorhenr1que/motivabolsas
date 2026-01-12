import { prisma } from "@/app/services/prisma";
import { assertAdminKey, buildCommonWhere } from "../_utils";
import type { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const { secret_key, search, uf, city, dateFrom, dateTo } = body as {
    secret_key?: string;
    search?: string;
    uf?: string;
    city?: string;
    dateFrom?: string;
    dateTo?: string;
  };

  if (!secret_key) {
    return Response.json({ error: "secret_key é obrigatório." }, { status: 400 });
  }

  const authErr = assertAdminKey(secret_key);
  if (authErr) return authErr;

  try {
    const commonWhere = buildCommonWhere({ search, uf, city, dateFrom, dateTo });

    const where: Prisma.UserWhereInput = {
      ...commonWhere,
      currentPayment: true,
      renovacao: { gt: 1 },
    };

    const grouped = await prisma.user.groupBy({
      by: ["course"],
      where,
      _count: { _all: true },
    });

    const courses = grouped
      .map((g) => ({
        course: g.course?.trim() ? g.course : "NÃO INFORMADO",
        total: g._count._all,
      }))
      .sort((a, b) => b.total - a.total);

    const totalAlunos = courses.reduce((acc, c) => acc + c.total, 0);

    return Response.json({ totalAlunos, courses });
  } catch {
    return Response.json({ error: "Erro ao buscar cursos (renovados)." }, { status: 500 });
  }
}