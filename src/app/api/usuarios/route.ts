import { prisma } from "../../services/prisma";

function parseBool(v: any): boolean {
    return v === true || v === "true" || v === 1 || v === "1";
}

export async function POST(request: Request) {
    let body: any;

    // 1) Parse seguro do JSON
    try {
        body = await request.json();
    } catch (err) {
        console.error("POST /api/usuarios - JSON inválido:", err);
        return Response.json(
            { error: "Body inválido. Envie JSON com Content-Type application/json." },
            { status: 400 }
        );
    }

    const { page, secret_key, onlyPaid } = body ?? {};

    // 2) Segredo (NÃO use NEXT_PUBLIC para segredo; deixei fallback só pra não quebrar seu projeto hoje)
    const secret = process.env.ADMIN_KEY ?? process.env.NEXT_PUBLIC_ADMIN_KEY;

    if (!secret) {
        console.error("POST /api/usuarios - ADMIN_KEY não definida no servidor");
        return Response.json(
            { error: "Configuração do servidor: chave admin não definida." },
            { status: 500 }
        );
    }

    // 3) Valida chave
    if (secret !== secret_key) {
        return Response.json(
            { error: "Chave de Administrador Incorreta." },
            { status: 400 }
        );
    }

    // 4) Normaliza page
    const pageNumber = Number(page ?? 0);
    if (!Number.isFinite(pageNumber) || pageNumber < 0) {
        return Response.json(
            { error: "Parâmetro 'page' inválido. Use número >= 0." },
            { status: 400 }
        );
    }

    // 5) Normaliza onlyPaid
    const onlyPaidBool = parseBool(onlyPaid);

    try {
        const take = 10;
        const skip = take * pageNumber;

        const whereCondition = onlyPaidBool ? { currentPayment: true } : {};

        // Logs úteis (pode remover depois)
        console.log("POST /api/usuarios - params:", {
            page: pageNumber,
            take,
            skip,
            onlyPaid: onlyPaidBool,
        });

        const totalItems = await prisma.user.count({
            where: whereCondition,
        });

        const users = await prisma.user.findMany({
            where: whereCondition,
            select: {
                id: true,
                birthDate: true,
                cpf: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true,
                currentPayment: true,
                firstPayment: true,
                customerId: true,
                renovacao: true,
                course: true,
                instituition: true,
                discount: true,
            },
            orderBy: { createdAt: "desc" },
            take,
            skip,
        });

        const totalPages = Math.ceil(totalItems / take);

        return Response.json({
            users,
            totalItems,
            totalPages,
            currentPage: pageNumber,
        });
    } catch (e: any) {
        // ERRO REAL AQUI
        console.error("POST /api/usuarios - ERRO REAL:", e);
        return Response.json(
            {
                error: "Falha ao listar usuários.",
                message: e?.message ?? String(e),
                code: e?.code,
                meta: e?.meta,
                // stack: process.env.NODE_ENV === "development" ? e?.stack : undefined,
            },
            { status: 500 }
        );
    }
}