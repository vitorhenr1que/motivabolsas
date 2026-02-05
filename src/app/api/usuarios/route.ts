
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
                firstPayment: true,
                customerId: true,
                renovacao: true,
                course: true,
                instituition: true,
                discount: true,
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

export async function PUT(request: Request) {
    const data = await request.json();
    const { secret_key, id, name, email, phone, currentPayment, firstPayment, renovacao, course, institution, discount, address } = data;

    const secret = process.env.NEXT_PUBLIC_ADMIN_KEY;
    if (secret !== secret_key) {
        return Response.json({ error: 'Chave de Administrador Incorreta.' }, { status: 400 });
    }

    try {
        // Prepare address update if provided
        // We assume the user has one address or we update the one provided by ID if we had it, 
        // but typically the UI sends the address fields.
        // Since the current UI accessed `addresses[0]`, we'll try to update the first address associated with the user 
        // or specifically the one passed if we had its ID. 
        // For simplicity/robustness, if we have address data, we update the user's addresses.

        let addressUpdate = {};
        if (address && address.id) {
            addressUpdate = {
                addresses: {
                    update: {
                        where: { id: address.id },
                        data: {
                            cep: address.cep,
                            city: address.city,
                            complement: address.complement,
                            neighborhood: address.neighborhood,
                            number: address.number,
                            street: address.street,
                            uf: address.uf,
                        }
                    }
                }
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                currentPayment,
                firstPayment, // Contrato assinado = true
                renovacao: Number(renovacao),
                course,
                instituition: institution,
                discount: discount ? String(discount) : null,
                ...addressUpdate
            }
        });

        return Response.json(updatedUser);

    } catch (e) {
        console.error(e);
        return Response.json({ error: 'Erro ao atualizar usuário.' }, { status: 500 });
    }
}