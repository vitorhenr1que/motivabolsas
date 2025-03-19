
import { prisma } from "@/app/services/prisma";
import { NextApiResponse } from "next";
import * as jose from 'jose'
import bcrypt from 'bcrypt'

export async function POST(req: Request, res: NextApiResponse){
    const { email, password } = await req.json()
    //Compare email
    const user = await prisma.user.findFirst({
        where: {
            email: email,
        },
    })
    if(!user){
        return Response.json({error: 'Usuário Inválido', token: "invalid"}, {status: 400})
    }
    //Compare password
    const hashedPassword = await bcrypt.hash(password, 10); // Gerou uma hash(token) de senha agora
    const isCorrectCompare = await bcrypt.compare(password, user.password) || await bcrypt.compare(user.password, hashedPassword) // Comparou a senha com a hash da senha no banco || comparou uma senha comum ex: Cachorro123@ do banco com uma hash gerada para essa senha Cachorro123@ na variável hashedPassword
    console.log('IS COMPARE ', isCorrectCompare)
    if(!isCorrectCompare){
        return Response.json({error: 'Senha Inválida', token: "invalid"}, {status: 400})
    }

    //create JWT token
    const secret = new TextEncoder().encode(
        process.env.JWT_SECRET,
      )
      const alg = 'HS256'
      
      const jwt = await new jose.SignJWT({})
        .setProtectedHeader({ alg })
        .setExpirationTime('72h')
        .setSubject(user.id.toString()) //setar subject user id
        .sign(secret)
      
      console.log(jwt)

    return Response.json({ token: jwt, user: user })
  

    
}