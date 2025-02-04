import { api } from "@/app/services/api"
import { getInterToken } from "@/app/services/inter-token"
import axios from "axios"
import fs from 'fs'
import https from 'https'

const contaCorrente = process.env.INTER_ACCOUNT
const version = process.env.NEXT_PUBLIC_VERSION
const sslCert = process.env.SSL_CERT_BASE64
const sslKey = process.env.SSL_KEY_BASE64
const sslCa = process.env.SSL_CA_BASE64

export async function POST(req: Request){
 
    
    
        try{
            if(!sslCert || !sslKey || !sslCa){
                return Response.json("Certificados não encontrados.", {status: 500})
            }
            // Converter Base64 de volta para String
            const cert = Buffer.from(sslCert, "base64").toString("utf-8");
            const key = Buffer.from(sslKey, "base64").toString("utf-8");
            const ca = Buffer.from(sslCa, "base64").toString("utf-8");
            // 🔹 (Opcional) Criar arquivos temporários para APIs que exigem caminhos físicos
            const certPath = "/tmp/interCert.crt";
            const keyPath = "/tmp/privateKey.key";
            const caPath = "/tmp/ca.crt";
            // Adiciona ao arquivo temporário certPath e keyPath o conteúdo do cert e key (certPath > cert)
            fs.writeFileSync(certPath, cert);
            fs.writeFileSync(keyPath, key);
            fs.writeFileSync(caPath, ca);
    
            const agent = new https.Agent({
                cert: fs.readFileSync(`${certPath}`),
                key: fs.readFileSync(`${keyPath}`),
                ca: fs.readFileSync(`${caPath}`)
          
            })

            const interToken = await getInterToken()

            const response = await axios.put("https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas/webhook",{
                webhookUrl: 'https://www.motivabolsas.com.br/api/cobrancas/webhook'
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