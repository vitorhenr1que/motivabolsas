import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/app/services/prisma";
import { ADMIN_PREVIEW_COOKIE } from "@/app/lib/auth";

export async function POST(request: Request) {
  const { userId, secret_key } = await request.json();
  const adminKey = process.env.ADMIN_KEY ?? process.env.NEXT_PUBLIC_ADMIN_KEY;

  if (!adminKey || secret_key !== adminKey) {
    return NextResponse.json({ error: "Chave de administrador incorreta." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: String(userId) }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({ adminPreview: true })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);

  cookies().set(ADMIN_PREVIEW_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_VERSION === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  cookies().delete(ADMIN_PREVIEW_COOKIE);
  return NextResponse.json({ ok: true });
}
