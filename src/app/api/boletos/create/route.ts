import axios from "axios";
import { createInterHttpsAgent } from "../../../lib/interMtls";

export const runtime = "nodejs"; // mTLS deve rodar no runtime Node

const contaCorrente = process.env.INTER_ACCOUNT;

function getNextFiveDaysISO() {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function POST(req: Request) {
  try {
    if (!contaCorrente) {
      return Response.json(
        { error: "INTER_ACCOUNT não configurada no .env" },
        { status: 500 }
      );
    }

    // Dados do request
    const {
      interToken,
      email,
      ddd,
      phone,
      houseNumber,
      complement,
      cpf,
      name,
      street,
      city,
      neighborhood,
      uf,
      cep,
    } = await req.json();

    if (!interToken) {
      return Response.json({ error: "interToken não informado." }, { status: 400 });
    }

    // Reutiliza o agent mTLS (cert + key)
    const agent = createInterHttpsAgent();

    // Monta payload da cobrança
    const payload = {
      seuNumero: cpf, // ideal: garantir que é único por cobrança
      valorNominal: 87,
      dataVencimento: getNextFiveDaysISO(),
      numDiasAgenda: 3,
      pagador: {
        email,
        ddd,
        telefone: phone,
        numero: houseNumber,
        complemento: complement,
        cpfCnpj: cpf,
        tipoPessoa: "FISICA",
        nome: name,
        endereco: street,
        cidade: city,
        bairro: neighborhood,
        uf,
        cep,
      },
    };

    // Chamada ao Inter
    const resp = await axios.post(
      "https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas",
      payload,
      {
        httpsAgent: agent, // ✅ mTLS aqui
        headers: {
          Authorization: `Bearer ${interToken}`,
          "x-conta-corrente": contaCorrente,
          "Content-Type": "application/json",
        },
        timeout: 20_000,
      }
    );

    return Response.json(resp.data, { status: 200 });
  } catch (err: any) {
    // Se Inter responder erro, geralmente está em err.response.data
    const status = err?.response?.status ?? 400;
    const interData = err?.response?.data ?? null;

    return Response.json(
      {
        error: err?.message ?? "Erro ao criar cobrança no Inter",
        inter: interData,
      },
      { status }
    );
  }
}