
import { prisma } from "@/app/services/prisma";
import { cookies } from "next/headers";
import { getSessionUser } from "@/app/lib/auth";

export async function POST(request: Request){
    const session = await getSessionUser();
    const email = cookies().get('email')?.value
    //const {email} = await request.json()
    console.log('entrou no e-mail:: ', email)
    //Compare email
 try{
    if (!session) return Response.json({ error: 'Não autorizado' }, { status: 401 });
    const userinfo = await prisma.user.findUnique({
        where: { id: session.userId },
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
            renovacao: true,
            customerId: true,
            addresses: true
        },
 
    })

    return Response.json(userinfo ? { ...userinfo, adminPreview: session.adminPreview === true } : null)
 }catch(e){
    return Response.json({error: 'Usuário Inválido'}, {status: 400})
 }
    

    

    
  

    
}
