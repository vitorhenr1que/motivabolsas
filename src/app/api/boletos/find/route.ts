import axios from "axios";
import { createInterHttpsAgent } from "../../../lib/interMtls";

export const runtime = "nodejs";

const contaCorrente = process.env.INTER_ACCOUNT;

export async function POST(req: Request) {
  try {
    // --- Validações de ambiente ---
    if (!contaCorrente) {
      return Response.json({ error: "INTER_ACCOUNT não configurada no .env" }, { status: 500 });
    }

    const { interToken, initialDate, finalDate, cpf } = await req.json();
 console.log('CHEGOU --->>>',interToken, initialDate, finalDate, cpf); 
   
    // --- Validações básicas do request ---
    if (!interToken) {
      return Response.json({ error: "interToken não informado." }, { status: 400 });
    }
    if (!initialDate || !finalDate) {
      return Response.json({ error: "initialDate e finalDate são obrigatórios." }, { status: 400 });
    }
    if (!cpf) {
      return Response.json({ error: "cpf (cpfCnpjPessoaPagadora) é obrigatório." }, { status: 400 });
    }

    // --- Agent mTLS (cert + key) ---
    const agent = createInterHttpsAgent();
 console.log('CHEGOU AGENT--->>>',agent);  
    // Endpoint do Inter
    const url = "https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas";

    // --- GET com query params ---
    // Axios monta a query string a partir de "params".
    const resp = await axios.get(url, {
      httpsAgent: agent,
      params: {
        dataInicial: initialDate, // esperado: YYYY-MM-DD
        dataFinal: finalDate,     // esperado: YYYY-MM-DD
        cpfCnpjPessoaPagadora: cpf,
        "paginacao.itensPorPagina": 15,
        "paginacao.paginaAtual": 0,
      },
      headers: {
        Authorization: `Bearer ${interToken}`,
        "x-conta-corrente": contaCorrente,
        // Em GET não precisa Content-Type, mas não atrapalha.
        "Content-Type": "application/json",
      },
      timeout: 20_000,
    });

    return Response.json(resp.data, { status: 200 });
  } catch (err: any) {
    const status = err?.response?.status ?? 400;
    const interData = err?.response?.data ?? null;

    return Response.json(
      {
        error: err?.message ?? "Erro ao listar cobranças no Inter",
        inter: interData,
      },
      { status }
    );
  }
}