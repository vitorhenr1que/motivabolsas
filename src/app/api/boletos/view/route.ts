// app/api/inter-cobranca-pdf/route.ts
// Busca o PDF de uma cobrança específica no Banco Inter usando mTLS
//
// Correções aplicadas:
// 1) Remove fs e arquivos temporários.
// 2) Usa https.Agent reutilizável (cert + key).
// 3) Força runtime Node.js.
// 4) Trata resposta como PDF (arraybuffer).
// 5) Tratamento correto de erros do axios.

import axios from "axios";
import { createInterHttpsAgent } from "../../../lib/interMtls";

export const runtime = "nodejs";

const contaCorrente = process.env.INTER_ACCOUNT;

export async function POST(req: Request) {
  try {
    if (!contaCorrente) {
      return Response.json(
        { error: "INTER_ACCOUNT não configurada no .env" },
        { status: 500 }
      );
    }

    const { interToken, codigoSolicitacao } = await req.json();

    // --- Validações do request ---
    if (!interToken) {
      return Response.json({ error: "interToken não informado." }, { status: 400 });
    }

    if (!codigoSolicitacao) {
      return Response.json(
        { error: "codigoSolicitacao não informado." },
        { status: 400 }
      );
    }

    // --- Agent mTLS (cert + key) ---
    const agent = createInterHttpsAgent();

    const url = `https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas/${codigoSolicitacao}/pdf`;

    // --- Chamada ao Inter ---
    // IMPORTANTE: responseType = arraybuffer (PDF é binário)
    const resp = await axios.get(url, {
      httpsAgent: agent,
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${interToken}`,
        "x-conta-corrente": contaCorrente,
      },
      timeout: 20_000,
    });

    // --- Retorna o PDF corretamente ---
    return new Response(resp.data, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="boleto-${codigoSolicitacao}.pdf"`,
      },
    });
  } catch (err: any) {
    const status = err?.response?.status ?? 400;
    const interData = err?.response?.data
      ? Buffer.isBuffer(err.response.data)
        ? "Erro binário (PDF)"
        : err.response.data
      : null;

    return Response.json(
      {
        error: err?.message ?? "Erro ao buscar PDF da cobrança no Inter",
        inter: interData,
      },
      { status }
    );
  }
}