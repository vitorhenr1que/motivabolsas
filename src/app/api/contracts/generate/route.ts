import { NextResponse } from "next/server";
import { prisma } from "../../../services/prisma";
import {
  exportGoogleDocAsPDF,
  replaceTextsAndImagesInGoogleDoc,
  duplicateGoogleDoc,
} from "../../../services/googleApisAuth";
import { sha256 } from "../../../lib/contract-signing";
import { getSessionUser } from "../../../lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

function isGoogleRateLimitError(err: any) {
  const message = String(err?.message ?? "");
  const code = err?.code ?? err?.status ?? err?.response?.status;
  const reason = err?.response?.data?.error?.errors?.[0]?.reason;

  return (
    (code === 403 || code === 429) &&
    (message.includes("User rate limit exceeded") ||
      message.includes("Rate Limit Exceeded") ||
      reason === "userRateLimitExceeded" ||
      reason === "rateLimitExceeded")
  );
}

export async function POST(request: Request) {
  let newFileId = "";

  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { name, cpf, semestre_atual, course, discount, dataAtual } =
      await request.json();

    // Confere usuário no banco
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // ✅ 0) Idempotência: se já existe contrato pendente, reutiliza (evita estourar quota)
    const existing = await prisma.contract.findFirst({
      where: { userId: user.id, status: "SENT" },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        contractId: existing.id,
        viewUrl: `/api/contracts/${existing.id}/pdf`,
        pageUrl: `/contracts/${existing.id}`,
        reused: true,
      });
    }

    // 1) Template do contrato
    const templateId = "1TkaZv_bzwoHmbG_n_5xGZnbODw1uStt8dtzJokLHOzk";

    // 2) Definição da duração do curso
    let duracao = "0";
    const courses4 = [
      "Administração",
      "Ciências Contábeis",
      "Educação Física (Bacharelado)",
      "Educação Física (Licenciatura)",
      "Nutrição",
      "Pedagogia",
      "Serviço Social",
    ];
    const courses2_5 = ["Estética e Cosmética"];
    const courses5 = [
      "Enfermagem",
      "Engenharia Civil",
      "Fisioterapia",
      "Farmácia",
      "Psicologia",
    ];

    if (courses4.includes(course)) duracao = "4";
    else if (courses2_5.includes(course)) duracao = "2,5";
    else if (courses5.includes(course)) duracao = "5";

    // 3) Duplicar template no Drive
    newFileId = await duplicateGoogleDoc(templateId, `Contrato - ${name} (FAZAG)`);
    if (!newFileId) {
      return NextResponse.json(
        { error: "Erro ao criar cópia do contrato." },
        { status: 500 }
      );
    }

    // 4) Substituir placeholders
    await replaceTextsAndImagesInGoogleDoc(
      newFileId,
      [
        { searchText: "{{NOME_COMPLETO}}", replaceText: name },
        { searchText: "{{CPF}}", replaceText: cpf },
        { searchText: "{{PERIODO}}", replaceText: semestre_atual },
        { searchText: "{{CURSO}}", replaceText: course },
        { searchText: "{{DESCONTO}}", replaceText: discount },
        { searchText: "{{DURACAO}}", replaceText: duracao },
        { searchText: "{{DATA_ATUAL}}", replaceText: dataAtual },
      ],
      []
    );

    // 5) Exportar PDF pra calcular hash
    const pdfBuffer = await exportGoogleDocAsPDF(newFileId);
    const originalPdfBytes = new Uint8Array(pdfBuffer);
    const originalHash = sha256(originalPdfBytes);

    // 6) Criar Contract no banco (SENT)
    const contract = await prisma.contract.create({
      data: {
        userId: user.id,
        title: `Contrato - ${name} (FAZAG)`,
        version: 1,
        status: "SENT",
        pdfUrl: `google-doc:${newFileId}`,
        pdfHash: originalHash,
      },
    });

    return NextResponse.json({
      ok: true,
      contractId: contract.id,
      viewUrl: `/api/contracts/${contract.id}/pdf`,
      pageUrl: `/contracts/${contract.id}`,
    });
  } catch (err: any) {
    // ✅ Tratamento específico de quota/rate limit do Google
    if (isGoogleRateLimitError(err)) {
      return NextResponse.json(
        {
          error:
            "Muitas solicitações ao Google para gerar o contrato. Aguarde alguns segundos e tente novamente.",
          detail: err?.message ?? String(err),
        },
        {
          status: 429,
          headers: { "Retry-After": "10" },
        }
      );
    }

    console.error("contracts/generate error:", err);
    return NextResponse.json(
      { error: "Falha ao gerar contrato", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
