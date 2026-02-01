import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../../services/prisma";
import { exportGoogleDocAsPDF, uploadPDFToDrive, deleteGoogleDoc, getFileParents } from "../../../../services/googleApisAuth";
import { appendEvidencePage, maskCpf, sha256 } from "../../../../lib/contract-signing";
import { getSessionUser } from "../../../../lib/auth";

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

function getGoogleDocId(pdfUrl: string) {
    const prefix = "google-doc:";
    if (!pdfUrl.startsWith(prefix)) return null;
    return pdfUrl.slice(prefix.length);
}

export async function POST(request: Request, ctx: { params: { id: string } }) {
    const contractId = ctx.params.id;

    const session = await getSessionUser();
    if (!session) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const consentText: string =
        body?.consentText ??
        "Declaro que li e concordo integralmente com o conteúdo deste contrato e o assino eletronicamente.";

    const contract = await prisma.contract.findFirst({
        where: { id: contractId, userId: session.userId },
        include: { user: true },
    });

    if (!contract) {
        return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    if (contract.status === "SIGNED") {
        return NextResponse.json({ ok: true, message: "Contrato já assinado" });
    }

    const fileId = getGoogleDocId(contract.pdfUrl);
    if (!fileId) {
        return NextResponse.json({ error: "pdfUrl inválido (não é google-doc)" }, { status: 400 });
    }

    // 1) Reexporta PDF do Google
    const pdfBuffer = await exportGoogleDocAsPDF(fileId);
    const originalPdfBytes = new Uint8Array(pdfBuffer);

    // 2) Hash e valida alteração
    const originalHashNow = sha256(originalPdfBytes);
    if (contract.pdfHash && contract.pdfHash !== originalHashNow) {
        return NextResponse.json(
            { error: "Contrato foi alterado após geração (hash não confere)." },
            { status: 409 }
        );
    }

    // 3) Evidências
    const evidenceId = crypto.randomUUID();
    const signedAtISO = new Date().toISOString();
    const ip = getIp(request);
    const userAgent = request.headers.get("user-agent") ?? undefined;

    // 4) PDF final com evidências
    const signedPdfBytes = await appendEvidencePage(originalPdfBytes, {
        evidenceId,
        contractId: contract.id,
        contractTitle: contract.title,
        contractVersion: contract.version,
        originalPdfHash: originalHashNow,
        signedAtISO,
        signer: {
            userId: contract.user.id,
            name: contract.user.name,
            email: contract.user.email,
            cpfMasked: maskCpf(contract.user.cpf),
        },
        device: { ip, userAgent },
        consentText,
    });

    const signedHash = sha256(signedPdfBytes);

    // ✅ 5) Upload final PDF to Google Drive e Persistência
    try {
        let parentFolderId: string | undefined = undefined;
        try {
            const parents = await getFileParents(fileId);
            if (parents && parents.length > 0) {
                parentFolderId = parents[0];
            }
        } catch (err) {
            console.warn("Não foi possível obter a pasta pai do contrato original, salvando na raiz.", err);
        }

        const finalFilename = `Contrato_Assinado_-_${contract.user.name.replace(/\s+/g, "_")}_FAZAG.pdf`;
        const signedFileId = await uploadPDFToDrive(finalFilename, signedPdfBytes, parentFolderId);

        // 6) Persistir no banco
        await prisma.$transaction(async (tx) => {
            // 1) Atualiza o contrato
            await tx.contract.update({
                where: { id: contract.id },
                data: {
                    status: "SIGNED",
                    signedAt: new Date(signedAtISO),
                    signedPdfHash: signedHash,
                    pdfUrl: `google-pdf:${signedFileId}`, // Update to point to the PDF file
                },
            });

            // 2) Registra a assinatura
            await tx.contractSignature.create({
                data: {
                    contractId: contract.id,
                    userId: contract.userId,
                    evidenceId,
                    signedAt: new Date(signedAtISO),
                    ip,
                    userAgent,
                    consentText,
                    evidence: {
                        googleDocFileId: fileId,
                        signedFileId: signedFileId,
                        contractName: contract.title,
                        originalPdfHash: originalHashNow,
                        signedPdfHash: signedHash,
                    },
                    originalPdfHash: originalHashNow,
                    signedPdfHash: signedHash,
                },
            });

            // 3) Evento de auditoria
            await tx.contractEvent.create({
                data: {
                    contractId: contract.id,
                    type: "SIGNED",
                    metadata: {
                        evidenceId,
                        signedAtISO,
                        ip,
                        userAgent,
                        originalHash: originalHashNow,
                        signedHash,
                        signedFileId,
                    },
                },
            });

            // ✅ 4) ATUALIZA O USER (firstPayment = true)
            await tx.user.update({
                where: { id: contract.userId },
                data: {
                    firstPayment: true,
                },
            });
        });

        // 7) Delete original Google Doc draft (optional)
        try {
            await deleteGoogleDoc(fileId);
        } catch (e) {
            console.error("Erro ao deletar rascunho do contrato no Drive:", e);
        }

    } catch (error: any) {
        console.error("Erro no processo de assinatura/upload:", error);
        return NextResponse.json(
            { error: `Falha ao processar assinatura: ${error.message || error}` },
            { status: 500 }
        );
    }

    // 8) Retornar PDF assinado (download)
    const filename = `Contrato_Assinado_-_${contract.user.name.replace(/\s+/g, "_")}_FAZAG.pdf`;
    const stream = uint8ToReadableStream(signedPdfBytes);

    return new NextResponse(stream, {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": String(signedPdfBytes.byteLength),
            "Cache-Control": "no-store",
        },
    });
}
