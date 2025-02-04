import { api } from "@/app/services/api"
import { getInterToken } from "@/app/services/inter-token"
import axios from "axios"
import fs from 'fs'
import https from 'https'

const contaCorrente = process.env.INTER_ACCOUNT
const cert = process.env.CERT_PATH
const key = process.env.KEY_PATH
const version = process.env.NEXT_PUBLIC_VERSION

export async function POST(req: Request){
 
    
    
        try{
            
            const agent = new https.Agent({
                cert: fs.readFileSync(`${cert}`),
                key: fs.readFileSync(`${key}`)
            })

            const interToken = await getInterToken()

            const response = await axios.put("https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas/webhook",{
                webhookUrl: version === 'dev' ? 'https://localhost:3000/api/cobrancas/webhook' : 'https://motivabolsas.com.br/api/cobrancas/webhook'
            } ,{
                httpsAgent: agent,
                
                headers: {
                    "Authorization": `Bearer ${interToken}`,
                    "x-conta-corrente": `${contaCorrente}`,
                    "Content-Type": "application/json"
                }
            })
            
            return Response.json(response.data, {status: 200})
        }catch(e){
            return Response.json({error: e}, {status: 400})
        }
       
}