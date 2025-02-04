import axios from "axios"
import fs from 'fs'
import https from 'https'


const contaCorrente = process.env.INTER_ACCOUNT
const sslCert = process.env.SSL_CERT_BASE64
const sslKey = process.env.SSL_KEY_BASE64

export async function POST(req: Request){
 
    const { interToken, initialDate, finalDate, cpf } = await req.json()

        try{
            if(!sslCert || !sslKey){
                return Response.json("Certificados não encontrados.", {status: 500})
            }
            // Converter Base64 de volta para String
            const cert = Buffer.from(sslCert, "base64").toString("utf-8");
            const key = Buffer.from(sslKey, "base64").toString("utf-8");
    
            // 🔹 (Opcional) Criar arquivos temporários para APIs que exigem caminhos físicos
            const certPath = "/tmp/interCert.crt";
            const keyPath = "/tmp/privateKey.key";
            
            // Adiciona ao arquivo temporário certPath e keyPath o conteúdo do cert e key (certPath > cert)
            fs.writeFileSync(certPath, cert);
            fs.writeFileSync(keyPath, key);
    
            const agent = new https.Agent({
                cert: fs.readFileSync(`${certPath}`),
                key: fs.readFileSync(`${keyPath}`)
          
            })
            const response = await axios.get("https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas/", {
                httpsAgent: agent,
                params: {
                    "dataInicial": `${initialDate}`,
                    "dataFinal": `${finalDate}`,
                    "cpfCnpjPessoaPagadora": `${cpf}`,
                    "paginacao.itensPorPagina": 15,
                    "paginacao.paginaAtual": 0
                },
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