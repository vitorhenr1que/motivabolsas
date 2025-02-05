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
    console.log('CORPO DO EVENTO: ', event[0] )
    console.log('seuNumero: ', event[0].seuNumero, "situacao: ", event[0].situacao)

       try{
        if(event[0].situacao){
            switch (event[0].situacao){
                case "RECEBIDO":
                    const refreshPayment = await prisma.user.update({
                        where: {
                            cpf: event[0].seuNumero,
                        },
                        data: {
                            currentPayment: true
                        }
                    })
                break;
            }
        }
        return Response.json(event[0], {status: 200})
       }catch(e){
            return Response.json({error: e}, {status: 400})
        }
       
}