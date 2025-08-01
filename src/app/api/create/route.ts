
import { prisma } from "@/app/services/prisma";
import { NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from 'bcrypt'

export async function POST(request: Request){
    const { email, password, cpf, name, birthDate, customerId, phone, cep, city, neighborhood, number, street, uf, complement, course, instituition } = await request.json()
    console.log('CPF NUMB: ', cpf)

    if(!!uf === false){
        return Response.json({error: "Por favor, insira o Estado (UF)"}, {status: 400})
       }
       if(!!city === false){
        return Response.json({error: "Por favor, insira a sua cidade"}, {status: 400})
       }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const createUser = await prisma.user.create({
            data: {
                email, 
                password: hashedPassword, 
                cpf,
                name, 
                customerId,
                phone,
                course,
                instituition,
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
