import axios from 'axios'
import fs from 'fs'
import https from 'https'


const clientId = process.env.INTER_CLIENT_ID
const clientSecret = process.env.INTER_CLIENT_SECRET
const authUrl = process.env.NEXT_PUBLIC_INTER_AUTH_URL
const sslCert = process.env.SSL_CERT_BASE64
const sslKey = process.env.SSL_KEY_BASE64

export async function POST(req: Request){
  // Adicionar secret depois para não ir direto só com o link
    
    const formData = {
        "client_id": `${clientId}`,
        "client_secret": `${clientSecret}`,
        "grant_type": 'client_credentials',
        "scope": 'boleto-cobranca.write boleto-cobranca.read'
        
    } 
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