import { NextResponse } from "next/server";
import { prisma } from "../../../services/prisma";
import { getSessionUser } from "../../../lib/auth";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
    const contractId = ctx.params.id;

    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const contract = await prisma.contract.findFirst({
            where: { id: contractId, userId: session.userId },
            select: {
                id: true,
                title: true,
                status: true,
                signedAt: true,
                createdAt: true,
            },
        });

        if (!contract) {
            return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
        }

        return NextResponse.json(contract);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Falha ao buscar detalhes do contrato", detail: error.message },
            { status: 500 }
        );
    }
}
