import { NextResponse } from "next/server";
import { prisma } from "../../../../services/prisma";
import { deleteGoogleDoc } from "../../../../services/googleApisAuth";

function getGoogleFileId(fileUrl: string | null): string | null {
  if (!fileUrl) return null;

  const prefixes = ["google-doc:", "google-pdf:"];
  const prefix = prefixes.find((item) => fileUrl.startsWith(item));
  return prefix ? fileUrl.slice(prefix.length) : null;
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url);
  const secretKey = searchParams.get("secret_key");
  const secret = process.env.ADMIN_KEY ?? process.env.NEXT_PUBLIC_ADMIN_KEY;

  if (!secret || secret !== secretKey) {
    return NextResponse.json({ error: "Chave de Administrador Incorreta ou não configurada." }, { status: 401 });
  }

  const userId = params.id;
  if (!userId) {
    return NextResponse.json({ error: "ID do usuário é obrigatório." }, { status: 400 });
  }

  try {
    const contracts = await prisma.contract.findMany({
      where: { userId },
      select: { id: true, pdfUrl: true },
    });

    if (contracts.length === 0) {
      return NextResponse.json({ error: "Nenhum contrato encontrado para este usuário." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      const contractIds = contracts.map((contract) => contract.id);

      await tx.contractSignature.deleteMany({ where: { contractId: { in: contractIds } } });
      await tx.contractEvent.deleteMany({ where: { contractId: { in: contractIds } } });
      await tx.contract.deleteMany({ where: { id: { in: contractIds } } });
      await tx.user.update({ where: { id: userId }, data: { firstPayment: false } });
    });

    const failedFileDeletions: string[] = [];
    await Promise.all(
      contracts.map(async ({ pdfUrl }) => {
        const fileId = getGoogleFileId(pdfUrl);
        if (!fileId) return;

        try {
          await deleteGoogleDoc(fileId);
        } catch (error) {
          console.error("Erro ao remover arquivo de contrato do Drive:", error);
          failedFileDeletions.push(fileId);
        }
      })
    );

    return NextResponse.json({
      ok: true,
      deletedContracts: contracts.length,
      driveFilesPendingDeletion: failedFileDeletions.length,
    });
  } catch (error: any) {
    console.error(`DELETE /api/usuarios/${userId}/contrato - ERRO:`, error);
    return NextResponse.json(
      { error: "Não foi possível excluir o contrato.", detail: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
