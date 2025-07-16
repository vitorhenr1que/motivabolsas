import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(req: Request) {
  // Verifica o token de segurança enviado pelo webhook do Prismic
  const secret = req.headers.get("x-prismic-secret");
  if (secret !== process.env.NEXT_PUBLIC_PRISMIC_ACCESS_TOKEN) {
    return NextResponse.json({ error: "Acesso negado, o token não foi passado ou está incorreto." }, { status: 401 });
  }

  // Revalida todas as páginas associadas à tag "prismic"
  revalidateTag("prismic");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}