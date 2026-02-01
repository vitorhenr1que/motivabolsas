import { prisma } from "@/app/services/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import * as jose from "jose";
import bcrypt from "bcrypt";

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
        const { oldPassword, newPassword } = body;

        if (!oldPassword || !newPassword) {
            return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
        }

        // Buscar usuário para comparar a senha antiga
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }

        // Verificar se a senha antiga está correta
        const isCorrectPassword = await bcrypt.compare(oldPassword, user.password);
        if (!isCorrectPassword) {
            return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
        }

        // Criptografar a nova senha
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Atualizar no banco
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });

        return NextResponse.json({
            success: true,
            message: "Senha atualizada com sucesso!"
        });

    } catch (error) {
        console.error("Erro ao atualizar senha:", error);
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
    }
}
