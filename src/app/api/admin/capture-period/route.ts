import { NextResponse } from "next/server";
import { prisma } from "../../../services/prisma";

export const runtime = "nodejs";

async function handleRequest(request: Request, save: boolean) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const secret = process.env.ADMIN_KEY ?? process.env.NEXT_PUBLIC_ADMIN_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Chave admin não configurada no servidor." }, { status: 500 });
  }
  if (body?.secret_key !== secret) {
    return NextResponse.json({ error: "Chave de Administrador Incorreta." }, { status: 401 });
  }

  const period = typeof body?.period === "string" ? body.period.trim() : "";
  if (save && !/^\d{4}\.[12]$/.test(period)) {
    return NextResponse.json({ error: "Informe o período no formato 2027.1 ou 2027.2." }, { status: 400 });
  }

  try {
    const settings = save
      ? await prisma.captureSettings.upsert({
          where: { id: "global" },
          create: { id: "global", period },
          update: { period },
        })
      : await prisma.captureSettings.findUnique({ where: { id: "global" } });

    return NextResponse.json({ period: settings?.period ?? null }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("capture-period error:", error);
    return NextResponse.json({ error: "Não foi possível acessar o período de captação." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return handleRequest(request, false);
}

export async function PUT(request: Request) {
  return handleRequest(request, true);
}
