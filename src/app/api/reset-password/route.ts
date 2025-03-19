import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from '../../services/prisma'



export async function POST(req: Request) {
  const { email, token, password } = await req.json();

  if (!email || !token || !password) {
    return Response.json({ message: "Dados incompletos" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: {
        email: email
    },
    select: {
        email: true,
        token: true,
        tokenExpiration: true,
        cpf: true
    }
  });

  if (!user || user.token !== token || Date.now() > Number(user.tokenExpiration)) {
    return Response.json({ message: "Token inválido ou expirado" }, { status: 400 });
  }

  // Hash da nova senha antes de salvar
  const hashedPassword = await bcrypt.hash(password, 10);
  

  const setPassword = await prisma.user.update({
    where: {
        cpf: user.cpf
    },
    data: {
        password: hashedPassword
    }
  })

  return Response.json({ message: "Senha alterada com sucesso!" }, {status: 200});
}