import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  const expectedSecret = process.env.PRISMIC_WEBHOOK_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "O segredo do webhook do Prismic não está configurado." },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !("secret" in payload) ||
    payload.secret !== expectedSecret
  ) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 401 });
  }

  // Revalida todas as páginas associadas à tag "prismic"
  revalidateTag("prismic");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
