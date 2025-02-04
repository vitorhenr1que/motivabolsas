import { api } from "@/app/services/api"
import { getInterToken } from "@/app/services/inter-token"
import { prisma } from "@/app/services/prisma"
import axios from "axios"
import fs from 'fs'
import https from 'https'

const contaCorrente = process.env.INTER_ACCOUNT
const version = process.env.NEXT_PUBLIC_VERSION
const sslCert = process.env.SSL_CERT_BASE64
const sslKey = process.env.SSL_KEY_BASE64
const sslCa = process.env.SSL_CA_BASE64

export async function POST(req: Request){
 
    const event = await req.json()
    
       try{
        if(event.situacao)
       
        switch (event.situacao){
            case "RECEBIDO":
                const refreshPayment = await prisma.user.update({
                    where: {
                        cpf: event.seuNumero,
                    },
                    data: {
                        currentPayment: true
                    }
                })
            break;
    
        }
        return Response.json(event, {status: 200})
       }catch(e){
            return Response.json({error: e}, {status: 400})
        }
       
}