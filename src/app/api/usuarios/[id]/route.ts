import { prisma } from "../../../services/prisma";
import { NextResponse } from "next/server";

function parseBool(v: any): boolean {
    return v === true || v === "true" || v === 1 || v === "1";
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get("secret_key");
    const id = params.id;

    // 1) Validação da chave administrativa
    const secret = process.env.ADMIN_KEY ?? process.env.NEXT_PUBLIC_ADMIN_KEY;
    if (!secret || secret !== secretKey) {
        return NextResponse.json(
            { error: "Chave de Administrador Incorreta ou não configurada." },
            { status: 401 }
        );
    }

    if (!id) {
        return NextResponse.json(
            { error: "ID do usuário não fornecido." },
            { status: 400 }
        );
    }

    try {
        // 2) Busca o usuário incluindo apenas o primeiro endereço com campos específicos
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                cpf: true,
                birthDate: true,
                course: true,
                instituition: true,
                discount: true,
                currentPayment: true,
                firstPayment: true,
                renovacao: true,
                customerId: true,
                createdAt: true,
                addresses: {
                    take: 1,
                    select: {
                        id: true,
                        cep: true,
                        city: true,
                        uf: true,
                        street: true,
                        number: true,
                        neighborhood: true,
                        complement: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado." },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error: any) {
        console.error(`GET /api/usuarios/${id} - ERRO:`, error);
        return NextResponse.json(
            {
                error: "Erro ao buscar detalhes do usuário.",
                message: error?.message,
                code: error?.code,
            },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;
    let body: any;

    try {
        body = await request.json();
    } catch (err) {
        return NextResponse.json({ error: "JSON inválido no body." }, { status: 400 });
    }

    const {
        secret_key,
        name,
        email,
        phone,
        currentPayment,
        firstPayment,
        renovacao,
        course,
        institution,
        discount,
        address,
    } = body;

    const secret = process.env.ADMIN_KEY ?? process.env.NEXT_PUBLIC_ADMIN_KEY;
    if (!secret || secret !== secret_key) {
        return NextResponse.json(
            { error: "Chave de Administrador Incorreta ou não configurada." },
            { status: 401 }
        );
    }

    if (!id) {
        return NextResponse.json({ error: "ID do usuário é obrigatório." }, { status: 400 });
    }

    try {
        let addressUpdate: any = {};
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
                        },
                    },
                },
            };
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                currentPayment: parseBool(currentPayment),
                firstPayment: parseBool(firstPayment),
                renovacao: renovacao === null || renovacao === undefined ? null : Number(renovacao),
                course,
                instituition: institution,
                discount: discount ? String(discount) : null,
                ...addressUpdate,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        console.error(`PUT /api/usuarios/${id} - ERRO:`, error);
        return NextResponse.json(
            {
                error: "Erro ao atualizar usuário.",
                message: error?.message,
                code: error?.code,
                meta: error?.meta,
            },
            { status: 500 }
        );
    }
}
