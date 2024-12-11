
import { prisma } from "@/app/services/prisma";
import { cookies } from "next/headers";

export async function POST(request: Request){
    const email = cookies().get('email')?.value
    //const {email} = await request.json()
    console.log('entrou no e-mail:: ', email)
    //Compare email
 try{
    const userinfo = await prisma.user.findUnique({
        where: {
            email: email,
        },
        select:{
            id: true,
            birthDate: true,
            cpf: true,
            createdAt: true,
            email: true,
            name: true,
            currentPayment: true,
            customerId: true,
            addresses: true
        },
 
    })

    return Response.json(userinfo)
 }catch(e){
    return Response.json({error: 'Usuário Inválido'}, {status: 400})
 }
    

    

    
  

    
}