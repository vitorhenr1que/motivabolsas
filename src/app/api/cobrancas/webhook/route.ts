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
    if(event[0]){ // Se o receber um array
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
                                currentPayment: true,
                                firstPayment: true,
                            }
                        })
                        const getPaidUser = await prisma.user.findUnique({
                            where: {
                                cpf: event[0].seuNumero,
                            },
                            select: {
                                phone: true,
                                name: true,
                                course: true,
                                instituition: true,
                                cpf: true,
                                discount: true,
                                createdAt: true,
                                id: true
                           }
                        })
                        await axios.post('https://webhook.fazag.edu.br:8443/webhook/recebido', {
                            getPaidUser,
                            event: event
                        }).catch(() => {
                            console.log(`Processo concluído, mas não foi possível notificar o webhook N8N de recebido.`)
                            console.log('seuNumero: ', event[0].seuNumero, "situacao: ", event[0].situacao)
                        })
                    break;
                }
            }
            return Response.json(event[0], {status: 200})
           }catch(e){
                return Response.json({error: e}, {status: 400})
            }
    }
    else{ // Se receber um objeto
        console.log('CORPO DO EVENTO: ', event )
        console.log('seuNumero: ', event.seuNumero, "situacao: ", event.situacao)
    
           try{ 
            if(event.situacao){
                switch (event.situacao){
                    case "RECEBIDO":
                        const refreshPayment = await prisma.user.update({
                            where: {
                                cpf: event.seuNumero,
                            },
                            data: {
                                currentPayment: true,
                                firstPayment: true,
                            }
                        })
                        const getPaidUser = await prisma.user.findUnique({
                            where: {
                                cpf: event.seuNumero,
                            },
                            select: {
                                phone: true,
                                name: true,
                                course: true,
                                instituition: true,
                                cpf: true,
                                discount: true,
                                createdAt: true,
                                id: true
                           }
                        })
                        await axios.post('https://webhook.fazag.edu.br:8443/webhook/recebido', {
                            getPaidUser,
                            event: event
                        }).catch(() => {
                            console.log(`Processo concluído, mas não foi possível notificar o webhook N8N de recebido.`)
                            console.log('seuNumero: ', event.seuNumero, "situacao: ", event.situacao)
                        })
                    break;
                    case "A_RECEBER":
                        const userInfo = await prisma.user.findUnique({
                            where: {
                                cpf: event.seuNumero,
                            },
                            select: {
                                phone: true,
                                name: true,
                                course: true,
                                instituition: true,
                                cpf: true,
                                discount: true,
                                createdAt: true,
                                id: true
                           }
                        })
                        const webhook = await axios.post('https://webhook.fazag.edu.br:8443/webhook/a-receber', {
                            userInfo,
                            event: event
                        }).catch(() => {
                            console.log(`Processo concluído, mas não foi possível notificar o webhook N8N a receber.`)
                            console.log('seuNumero: ', event.seuNumero, "situacao: ", event.situacao)
                        })
                    break;
                }
            }
            return Response.json(event, {status: 200})
           }catch(e){
                return Response.json({error: e}, {status: 400})
            }
    }
    
       
}