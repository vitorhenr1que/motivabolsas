import { prisma } from "@/app/services/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import * as jose from "jose";

export async function PATCH(request: Request) {
    const token = cookies().get('Authorization')?.value;

    if (!token) {
        return NextResponse.json({ error: "Sessão expirada ou inválida" }, { status: 401 });
    }

    try {
        // Verificar JWT e obter userId (sub)
        const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
        const { payload } = await jose.jwtVerify(token, secret);
        const userId = payload.sub;

        if (!userId) {
            return NextResponse.json({ error: "Token inválido" }, { status: 401 });
        }

        const body = await request.json();

        // Extraímos os campos permitidos, ignorando qualquer userId vindo do body
        const { phone, addresses } = body;

        // Identificação exclusiva via userId do Token (única fonte de verdade)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { addresses: true }
        });

        if (!user) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }

        // Validação de Telefone (padrão: (XX) XXXXX-XXXX)
        if (phone) {
            const phoneNumbers = phone.replace(/\D/g, "");
            if (phoneNumbers.length !== 11) {
                return NextResponse.json({ error: "Formato de telefone inválido" }, { status: 400 });
            }
        }

        // Inicia atualização dos dados básicos do usuário
        const updateData: any = {};
        if (phone) updateData.phone = phone;

        if (Object.keys(updateData).length > 0) {
            await prisma.user.update({
                where: { id: user.id },
                data: updateData
            });
        }

        // Atualização de Endereço (considerando o primeiro endereço da lista como principal)
        if (addresses && addresses.length > 0) {
            const addr = addresses[0];
            const addressData = {
                cep: addr.cep,
                street: addr.street,
                number: addr.number,
                complement: addr.complement,
                neighborhood: addr.neighborhood,
                city: addr.city,
                uf: addr.uf
            };

            if (user.addresses.length > 0) {
                // Atualiza endereço existente
                await prisma.address.update({
                    where: { id: user.addresses[0].id },
                    data: addressData
                });
            } else {
                // Cria novo endereço vinculado ao userId autenticado
                await prisma.address.create({
                    data: {
                        ...addressData,
                        userId: user.id
                    }
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Perfil atualizado com sucesso!"
        });

    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        return NextResponse.json({ error: "Erro interno no servidor ao processar atualização" }, { status: 500 });
    }
}
