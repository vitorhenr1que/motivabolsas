import axios from "axios"
import fs from 'fs'
import https from 'https'


const contaCorrente = process.env.INTER_ACCOUNT
const cert = process.env.CERT_PATH
const key = process.env.KEY_PATH


export async function POST(req: Request){
    function getNextFiveDays(){
        const dataAtual = new Date();
        dataAtual.setDate(dataAtual.getDate() + 5);
        const dataFormatada = dataAtual.toISOString().split("T")[0];
        return dataFormatada
    }
  
    const { interToken, email, ddd, phone, houseNumber, complement, cpf, name, street, city, neighborhood, uf, cep } = await req.json()
   
        try{
            const agent = new https.Agent({
                cert: fs.readFileSync(`${cert}`),
                key: fs.readFileSync(`${key}`)
            })
            const response = await axios.post("https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas",{
                seuNumero: cpf, // Gerar número aleatório com 15 dígitos
	            valorNominal: 87,
	            dataVencimento: getNextFiveDays(), // YYYY-MM-DD
	            numDiasAgenda: 3,
	            pagador: {
		            email: email,
		            ddd: ddd,
		            telefone: phone,
		            numero: houseNumber,
		            complemento: complement,
		            cpfCnpj: cpf,
		            tipoPessoa: "FISICA",
		            nome: name,
		            endereco: street,
		            cidade: city,
		            bairro: neighborhood,
		            uf: uf,
		            cep: cep
                }
            }, {
                httpsAgent: agent,
                headers: {
                    "Authorization": `Bearer ${interToken}`,
                    "x-conta-corrente": `${contaCorrente}`,
                    "Content-Type": "application/json"
                }
            })
            console.log(response.data, 'TESTE')
            return Response.json(response.data, {status: 200})
        }catch(e){
            return Response.json({error: e}, {status: 400})
        }
       
}