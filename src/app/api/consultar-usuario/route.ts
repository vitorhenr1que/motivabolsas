
import { prisma } from "@/app/services/prisma";
import { cookies } from "next/headers";

export async function POST(request: Request){
    const {id} = await request.json()
 try{
    const consulta = await prisma.user.findUnique({
        where: {
            id: id,
        },
        select:{
            id: true,
            birthDate: true,
            cpf: true,
            createdAt: true,
            email: true,
            name: true,
            phone: true,
            course: true,
            discount: true,
            instituition: true,
            currentPayment: true,
            firstPayment: true,
            customerId: true,
            addresses: true
        },
 
    })

    return Response.json(consulta)
 }catch(e){
    return Response.json({error: 'Usuário Inválido'}, {status: 400})
 }
}