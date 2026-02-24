import { prisma } from "@/app/services/prisma";

export async function POST(request: Request) {
    const { secret_key, onlyPaid, name } = await request.json();

    const secret = process.env.ADMIN_KEY ?? process.env.NEXT_PUBLIC_ADMIN_KEY;

    if (secret !== secret_key) {
        return Response.json({ error: 'Chave de Administrador Incorreta.' }, { status: 400 });
    }

    try {
        const whereCondition: any = {
            OR: [
                { name: { contains: name } },
                { cpf: { contains: name } },
                { id: name }
            ]
        };

        if (onlyPaid === true) {
            whereCondition.currentPayment = true;
        }

        const users = await prisma.user.findMany({
            where: whereCondition,
            select: {
                id: true,
                birthDate: true,
                cpf: true,
                name: true,
                email: true,
                phone: true,
                course: true,
                instituition: true,
                discount: true,
                createdAt: true,
                currentPayment: true,
                firstPayment: true,
                renovacao: true,
                customerId: true,
                addresses: {
                    select: {
                        id: true,
                        cep: true,
                        city: true,
                        complement: true,
                        neighborhood: true,
                        number: true,
                        street: true,
                        uf: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        return Response.json(users);

    } catch (e: any) {
        console.error("POST /api/find-users-with-address - Erro:", e);
        return Response.json({
            error: 'Erro ao buscar usuários.',
            message: e?.message
        }, { status: 500 });
    }
}
