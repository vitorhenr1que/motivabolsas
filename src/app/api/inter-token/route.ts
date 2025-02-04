import axios from 'axios'
import fs from 'fs'
import https from 'https'


const cert = process.env.CERT_PATH
const key = process.env.KEY_PATH
const clientId = process.env.INTER_CLIENT_ID
const clientSecret = process.env.INTER_CLIENT_SECRET
const authUrl = process.env.NEXT_PUBLIC_INTER_AUTH_URL

export async function POST(req: Request){
  // Adicionar secret depois para não ir direto só com o link
    
    const formData = {
        "client_id": `${clientId}`,
        "client_secret": `${clientSecret}`,
        "grant_type": 'client_credentials',
        "scope": 'boleto-cobranca.write boleto-cobranca.read'
        
    } 
    try{
        const agent = new https.Agent({
            cert: fs.readFileSync(`${cert}`),
            key: fs.readFileSync(`${key}`)
        })
        console.log('teste agent', agent)
        const response = await axios.post(`${authUrl}`, formData, {
            httpsAgent: agent,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

       return Response.json(response.data.access_token, {status: 200})
    }catch(e){
       return Response.json(e, {status: 400})
    }
}