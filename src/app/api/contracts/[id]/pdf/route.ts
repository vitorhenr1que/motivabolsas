import { NextResponse } from "next/server";
import { prisma } from "../../../../services/prisma";
import { exportGoogleDocAsPDF, downloadFileFromDrive } from "../../../../services/googleApisAuth";
import { getSessionUser } from "../../../../lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

function uint8ToReadableStream(bytes: Uint8Array) {
    return new ReadableStream<Uint8Array>({
        start(controller) {
            controller.enqueue(bytes);
            controller.close();
        },
    });
}



export async function GET(request: Request, ctx: { params: { id: string } }) {
    const contractId = ctx.params.id;

    const session = await getSessionUser();
    if (!session) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // ✅ só o dono pode visualizar
    const contract = await prisma.contract.findFirst({
        where: { id: contractId, userId: session.userId },
    });

    if (!contract) {
        return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    const pdfUrl = contract.pdfUrl;
    let pdfBuffer: Buffer;

    if (pdfUrl.startsWith("google-doc:")) {
        const fileId = pdfUrl.replace("google-doc:", "");
        pdfBuffer = await exportGoogleDocAsPDF(fileId);
    } else if (pdfUrl.startsWith("google-pdf:")) {
        const fileId = pdfUrl.replace("google-pdf:", "");
        pdfBuffer = await downloadFileFromDrive(fileId);
    } else {
        return NextResponse.json({ error: "pdfUrl de formato desconhecido ou inválido" }, { status: 400 });
    }

    const bytes = new Uint8Array(pdfBuffer);
    const stream = uint8ToReadableStream(bytes);

    return new NextResponse(stream, {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="contrato-${contract.id}.pdf"`,
            "Content-Length": String(bytes.byteLength),
            "Cache-Control": "no-store",
        },
    });
}
