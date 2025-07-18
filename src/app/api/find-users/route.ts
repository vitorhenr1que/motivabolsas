
import { prisma } from "@/app/services/prisma";
import { cookies } from "next/headers";

export async function POST(request: Request){
    const { secret_key, onlyPaid, name } = await request.json()

    //Com paginação
    const secret = process.env.NEXT_PUBLIC_ADMIN_KEY
    if (secret === secret_key){ 
        
        try{
            if(onlyPaid === false){ // Se estiver desmarcado no site mande todos os usuários
                console.log('entrou aq')
                const userinfo = await prisma.user.findMany({
                  where: {
                      OR: [
                          {
                              name: {
                                  contains: name,
                              },
                          },
                          {
                              cpf: {
                                  contains: name,
                              },
                          },
                          {
                              id: name, // Busca direta por ID (assumindo que 'name' pode ser um ID no input)
                          },
                      ],
                  },
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
                      customerId: true,
                      addresses: true,
                  },
                  orderBy: { createdAt: "desc" },
              });
                console.log('Teste API find-users', userinfo)
                return Response.json(userinfo)
            }
            else{
                const userinfo = await prisma.user.findMany({
                    where: {
                        currentPayment: true,
                        OR: [
                            {
                              name: {
                                contains: name,
                              },
                            },
                            {
                              AND: {
                                cpf: {
                                  contains: name,
                                },
                              },
                            },
                          ],
                    },
                    select:{
                        id: true,
                        birthDate: true,
                        cpf: true,
                        name: true,
                        course: true,
                        instituition: true,
                        discount: true,
                        email: true,
                        phone: true,
                        createdAt: true,
                        currentPayment: true,
                        customerId: true,
                        addresses: true
                    }
                })
            
                return Response.json(userinfo)
            }
            
         }catch(e){
            return Response.json({error: 'Usuário Inválido'}, {status: 400})
         }
    }
    return Response.json({error: 'Chave de Administrador Incorreta.'}, {status: 400})
}