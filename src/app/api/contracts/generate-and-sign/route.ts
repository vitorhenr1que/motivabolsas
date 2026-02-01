import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../services/prisma";
import {
  exportGoogleDocAsPDF,
  replaceTextsAndImagesInGoogleDoc,
  duplicateGoogleDoc,
} from "../../../services/googleApisAuth";

import { appendEvidencePage, maskCpf, sha256 } from "../../../lib/contract-signing";

export const runtime = "nodejs";
export const maxDuration = 60;

function getIp(request: Request) {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? undefined;
}

function uint8ToReadableStream(bytes: Uint8Array) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

export async function POST(request: Request) {
  let newFileId = "";

  try {
    const {
      userId,
      name,
      cpf,
      semestre_atual,
      course,
      discount,
      dataAtual,
    } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const templateId = "1TkaZv_bzwoHmbG_n_5xGZnbODw1uStt8dtzJokLHOzk";

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
    const courses5 = ["Enfermagem", "Engenharia Civil", "Fisioterapia", "Farmácia", "Psicologia"];

    if (courses4.includes(course)) duracao = "4";
    else if (courses2_5.includes(course)) duracao = "2,5";
    else if (courses5.includes(course)) duracao = "5";

    newFileId = await duplicateGoogleDoc(templateId, `Contrato - ${name} (FAZAG)`);

    if (!newFileId) {
      return NextResponse.json({ error: "Erro ao criar cópia do contrato." }, { status: 500 });
    }

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

    const pdfBuffer = await exportGoogleDocAsPDF(newFileId);
    const originalPdfBytes = new Uint8Array(pdfBuffer);

    const originalHash = sha256(originalPdfBytes);

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

    const evidenceId = crypto.randomUUID();
    const signedAtISO = new Date().toISOString();
    const ip = getIp(request);
    const userAgent = request.headers.get("user-agent") ?? undefined;

    const consentText =
      "Declaro que li e concordo integralmente com o conteúdo deste contrato e o assino eletronicamente.";

    const signedPdfBytes = await appendEvidencePage(originalPdfBytes, {
      evidenceId,
      contractId: contract.id,
      contractTitle: contract.title,
      contractVersion: contract.version,
      originalPdfHash: originalHash,
      signedAtISO,
      signer: {
        userId: user.id,
        name: user.name,
        email: user.email,
        cpfMasked: maskCpf(user.cpf),
      },
      device: { ip, userAgent },
      consentText,
    });

    const signedHash = sha256(signedPdfBytes);

    await prisma.$transaction(async (tx) => {
      await tx.contract.update({
        where: { id: contract.id },
        data: {
          status: "SIGNED",
          signedAt: new Date(signedAtISO),
          signedPdfUrl: null,
          signedPdfHash: signedHash,
        },
      });

      await tx.contractSignature.create({
        data: {
          contractId: contract.id,
          userId: user.id,
          evidenceId,
          signedAt: new Date(signedAtISO),
          ip,
          userAgent,
          consentText,
          evidence: {
            googleDocFileId: newFileId,
            contractName: contract.title,
            originalPdfHash: originalHash,
            signedPdfHash: signedHash,
          },
          originalPdfHash: originalHash,
          signedPdfHash: signedHash,
        },
      });

      await tx.contractEvent.create({
        data: {
          contractId: contract.id,
          type: "SIGNED",
          metadata: {
            evidenceId,
            signedAtISO,
            ip,
            userAgent,
            originalHash,
            signedHash,
          },
        },
      });
    });

    const filename = `Contrato_Assinado_-_${name.replace(/\s+/g, "_")}_FAZAG.pdf`;

    // ✅ retorno que compila em qualquer configuração TS (BodyInit = ReadableStream)
    const stream = uint8ToReadableStream(signedPdfBytes);

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(signedPdfBytes.byteLength),
      },
    });
  } catch (err: any) {
    console.error("generate-and-sign error:", err);

    return NextResponse.json(
      { error: "Falha ao gerar/assinar contrato", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
