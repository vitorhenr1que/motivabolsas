
import { prisma } from "@/app/services/prisma";
import { cookies } from "next/headers";

export async function POST(request: Request){
    const { page, secret_key } = await request.json()

    //Com paginação
    const secret = process.env.NEXT_PUBLIC_ADMIN_KEY
    if (secret === secret_key){
        try{
            const userinfo = await prisma.user.findMany({
        
                select:{
                    id: true,
                    birthDate: true,
                    cpf: true,
                    name: true,
                    email: true,
                    phone: true,
                    createdAt: true,
                    currentPayment: true,
                    customerId: true,
                    addresses: true
                },
                orderBy: {createdAt: "desc"},
                take: 10,
                skip: 10 * page
          
            })
        
            return Response.json(userinfo)
         }catch(e){
            return Response.json({error: 'Usuário Inválido'}, {status: 400})
         }
    }
    return Response.json({error: 'Chave de Administrador Incorreta.'}, {status: 400})
}