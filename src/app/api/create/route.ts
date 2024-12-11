
import { prisma } from "@/app/services/prisma";
import { NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";


export async function POST(request: Request){
    const { email, password, cpf, name, birthDate, customerId, phone, cep, city, neighborhood, number, street, uf, complement } = await request.json()
    console.log('CPF NUMB: ', cpf)


    try {
        const createUser = await prisma.user.create({
            data: {
                email, 
                password, 
                cpf,
                name, 
                customerId,
                phone,
                addresses: {
                    create: {
                        cep,
                        city,
                        neighborhood,
                        number,
                        street,
                        uf,
                        complement
                    }
                }
            }
        })
    
        return Response.json({createUser}, {status: 200})
    }
    catch(err){
       return Response.json({err}, {status: 500})
    }
    
}
