import { api } from '../../services/api'
import { prisma } from '../../services/prisma'
import crypto from 'crypto'
import { NextApiRequest } from 'next'
import { NextResponse } from 'next/server'

export async function POST(request: Request){
    console.log('testeeeeeeeeeeeeee')
    const {email} = await request.json()

    console.log(email)
    if(!email){
        console.log('Entrou')
        return Response.json({message: "E-mail Obrigatório"}, {status: 400})
    }
    try{
        const getUser = await prisma.user.findUnique({
            where: {
                email: email
            },
            select: {
                email: true,
                name: true,
            }
        })
        if(!getUser?.email){
            return Response.json({message: "E-mail Inválido!"}, {status: 400})
        }
        console.log(getUser, '<= email')
        const token = crypto.randomBytes(32).toString('hex') //Ex: fbe5d08a452082cf1376fbc52d166262098085b4b0e4440a7c8285dc762809a8
        const expiration = Date.now() + 1000 * 60 * 15 //Ex: 1742327534156
        if(getUser?.email){
            console.log('entrou no expirationUpdate')
            const expirationUpdate = await prisma.user.update({
                where: {
                    email: email
                },
                data: {
                    tokenExpiration: `${expiration}`,
                    token: token
                }
            })
            console.log(expirationUpdate, 'TTTT')
            console.log("Expiration: ", expiration)
        }

        console.log({name: getUser.name, email: getUser.email, link: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/redefinir-senha?email=${email}&token=${token}`})
        await api.post('/reset-request/sendmail', {
                name: getUser.name,
                email: getUser.email,
                link: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/redefinir-senha?email=${email}&token=${token}`
        })
        
        console.log(token)
        return Response.json(`${process.env.NEXT_PUBLIC_WEBSITE_URL}/redefinir-senha?email=${email}&token=${token}`, {status: 200}) //LEMBRAR DE ADICIONAR A VARIAVEL DE AMBIENTE NA VERCEL
    }
    catch(e: any){
        if(e.code === "P2025") {
            return Response.json({message: "E-mail Inválido"}, {status: 400})
        }
        return Response.json(e, {status: 400})
    }
}