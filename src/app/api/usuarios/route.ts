
import { prisma } from "../../services/prisma";

export async function POST(request: Request) {
    const { page, secret_key, onlyPaid } = await request.json();

    const secret = process.env.NEXT_PUBLIC_ADMIN_KEY;
    if (secret !== secret_key) {
        return Response.json({ error: 'Chave de Administrador Incorreta.' }, { status: 400 });
    }

    try {
        const take = 10;
        const skip = take * page;

        const whereCondition = onlyPaid ? { currentPayment: true } : {};

        // Buscar total de usuários
        const totalItems = await prisma.user.count({
            where: whereCondition
        });

        // Buscar usuários da página atual
        const userinfo = await prisma.user.findMany({
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
                customerId: true,
                renovacao: true,
                addresses: true
            },
            orderBy: { createdAt: "desc" },
            take,
            skip,
        });

        const totalPages = Math.ceil(totalItems / take);

        return Response.json({
            users: userinfo,
            totalItems,
            totalPages,
            currentPage: page
        });

    } catch (e) {
        return Response.json({ error: 'Usuário Inválido' }, { status: 400 });
    }
}