import axios from "axios";
import { createInterHttpsAgent } from "../../../lib/interMtls";

export const runtime = "nodejs";

const contaCorrente = process.env.INTER_ACCOUNT;

export async function POST(req: Request) {
    try {
        const { interToken, codigoSolicitacao } = await req.json();

        if (!interToken || !codigoSolicitacao) {
            return Response.json({ error: "interToken e codigoSolicitacao são obrigatórios." }, { status: 400 });
        }

        if (!contaCorrente) {
            return Response.json({ error: "INTER_ACCOUNT não configurado." }, { status: 500 });
        }

        const agent = createInterHttpsAgent();
        // Inter V3: GET /cobrancas/{codigoSolicitacao}/pdf
        const url = `https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas/${codigoSolicitacao}/pdf`;

        const resp = await axios.get(url, {
            httpsAgent: agent,
            headers: {
                Authorization: `Bearer ${interToken}`,
                "x-conta-corrente": contaCorrente,
            },
            timeout: 20_000,
        });

        // Espera-se { pdf: "base64..." }
        return Response.json(resp.data, { status: 200 });
    } catch (err: any) {
        console.error("Erro /api/boletos/pdf:", err.message);
        return Response.json(
            {
                error: err?.message ?? "Erro ao recuperar PDF do boleto",
            },
            { status: err?.response?.status ?? 400 }
        );
    }
}
