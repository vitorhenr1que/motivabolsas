import { prisma } from "@/app/services/prisma";
import { assertAdminKey, buildCommonWhere } from "../_utils";
import type { Prisma } from "@prisma/client";

function calcNovosPendentesWindow() {
  const now = new Date();

  const end = new Date(now);
  end.setDate(end.getDate() - 2);

  const start = new Date(now);
  start.setMonth(start.getMonth() - 2);

  return { start, end };
}

export const maxDuration = 30; // Aumenta o timeout para 30 segundos (Vercel Pro)

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const { secret_key, search, uf, city, course } = body as {
    secret_key?: string;
    search?: string;
    uf?: string;
    city?: string;
    course?: string;
  };
  if (!secret_key) {
    return Response.json({ error: "secret_key é obrigatório." }, { status: 400 });
  }

  const authErr = assertAdminKey(secret_key);
  if (authErr) return authErr;

  try {
    // Filtros comuns (busca/uf/city/course)
    const commonWhere = buildCommonWhere({ search, uf, city, course });

    const { start, end } = calcNovosPendentesWindow();

    const whereTotal: Prisma.UserWhereInput = {
      ...commonWhere,
    };

    const wherePaid: Prisma.UserWhereInput = {
      ...commonWhere,
      currentPayment: true,
    };

    const whereNovos: Prisma.UserWhereInput = {
      ...commonWhere,
      currentPayment: true,
      renovacao: 1,
    };

    const whereRenovados: Prisma.UserWhereInput = {
      ...commonWhere,
      currentPayment: true,
      renovacao: { gt: 1 },
    };

    const whereRenovadosPendentes: Prisma.UserWhereInput = {
      ...commonWhere,
      currentPayment: false,
      renovacao: { gte: 1 },
    };

    const whereNovosPendentes: Prisma.UserWhereInput = {
      ...commonWhere,
      currentPayment: false,
      createdAt: { gte: start, lte: end },
    };

    const [
      totalUsers,
      totalPaid,
      novosAlunos,
      renovados,
      renovadosPendentes,
      novosPendentes,
    ] = await Promise.all([
      prisma.user.count({ where: whereTotal }),
      prisma.user.count({ where: wherePaid }),
      prisma.user.count({ where: whereNovos }),
      prisma.user.count({ where: whereRenovados }),
      prisma.user.count({ where: whereRenovadosPendentes }),
      prisma.user.count({ where: whereNovosPendentes }),
    ]);

    return Response.json({
      totals: {
        totalUsers,
        totalPaid,
        novosAlunos,
        renovados,
        renovadosPendentes,
        novosPendentes,
      },
      rules: {
        novosPendentesWindow: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      },
    });
  } catch (e) {
    console.error("Erro detalhado no summary:", e);
    return Response.json({
      error: "Erro ao gerar summary.",
      message: e instanceof Error ? e.message : "Erro desconhecido"
    }, { status: 500 });
  }
}