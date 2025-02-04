import axios from "axios"
import fs from 'fs'
import https from 'https'
import path from "path"

const contaCorrente = process.env.INTER_ACCOUNT
const cert = process.env.CERT_PATH
const key = process.env.KEY_PATH
const certPath = path.join(process.cwd(), `${cert}`);
const keyPath = path.join(process.cwd(), `${key}`);

export async function POST(req: Request){
 
    const { interToken, initialDate, finalDate, cpf } = await req.json()

        try{
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