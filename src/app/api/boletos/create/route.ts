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
    const body = await req.json();
    console.log("RECEBIDO EM /api/boletos/create:", JSON.stringify(body, null, 2));

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
    } = body;

    // Se o token vier como objeto, extrai a string
    let token = interToken;
    if (interToken && typeof interToken === 'object' && interToken.access_token) {
      token = interToken.access_token;
    } else if (interToken && typeof interToken === 'object' && interToken.interToken) {
      token = interToken.interToken;
    }

    if (!token) {
      return Response.json({ error: "interToken não informado." }, { status: 400 });
    }

    // Reutiliza o agent mTLS (cert + key)
    const agent = createInterHttpsAgent();

    // Sanitização básica
    const sanitizedCpf = cpf.replace(/\D/g, "");
    const sanitizedCep = cep.replace(/\D/g, "");

    // Monta payload da cobrança
    // O usuário solicitou que o seuNumero seja o CPF formatado (ex: 000.000.000-00)
    const seuNumero = cpf;

    const payload = {
      seuNumero,
      valorNominal: 87,
      dataVencimento: getNextFiveDaysISO(),
      numDiasAgenda: 3,
      pagador: {
        email,
        ddd,
        telefone: phone.replace(/\D/g, ""),
        numero: houseNumber,
        complemento: complement || "",
        cpfCnpj: sanitizedCpf,
        tipoPessoa: "FISICA",
        nome: name,
        endereco: street,
        cidade: city,
        bairro: neighborhood,
        uf,
        cep: sanitizedCep,
      },
    };

    console.log("PAYLOAD INTER:", JSON.stringify(payload, null, 2));


    // Chamada ao Inter
    const resp = await axios.post(
      "https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas",
      payload,
      {
        httpsAgent: agent, // ✅ mTLS aqui
        headers: {
          Authorization: `Bearer ${token}`,
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

    console.error("ERRO INTER API:", {
      status,
      data: interData,
      message: err.message,
    });

    return Response.json(
      {
        error: err?.message ?? "Erro ao criar cobrança no Inter",
        inter: interData,
      },
      { status }
    );
  }
}