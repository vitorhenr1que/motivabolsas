import { NextResponse } from "next/server";
import { getSessionUser } from "../../../lib/auth";
import { prisma } from "../../../services/prisma";

export async function GET() {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
        }

        const signedContract = await prisma.contract.findFirst({
            where: { userId: session.userId, status: "SIGNED" },
            orderBy: { signedAt: "desc" },
            select: {
                id: true,
                status: true,
                signedAt: true,
                createdAt: true,
            },
        });

        if (signedContract) {
            return NextResponse.json({
                hasContract: true,
                isSigned: true,
                contract: signedContract,
            });
        }

        const pendingContract = await prisma.contract.findFirst({
            where: { userId: session.userId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                status: true,
                signedAt: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            hasContract: Boolean(pendingContract),
            isSigned: false,
            contract: pendingContract,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Falha ao verificar contrato", detail: error.message },
            { status: 500 }
        );
    }
}
