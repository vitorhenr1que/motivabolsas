import axios from "axios";
import { createInterHttpsAgent } from "../../../lib/interMtls";
import { toStudyFeeAmount } from "@/app/config/study-fee";
import { prisma } from "@/app/services/prisma";
import { getSessionUser } from "@/app/lib/auth";

export const runtime = "nodejs"; // mTLS deve rodar no runtime Node

const contaCorrente = process.env.INTER_ACCOUNT;

function onlyDigits(value: unknown) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

function redactBoletoRequest(body: Record<string, unknown>) {
  return {
    ...body,
    interToken: body.interToken ? "[REDACTED]" : undefined,
    secret_key: body.secret_key ? "[REDACTED]" : undefined,
    cpf: typeof body.cpf === "string"
      ? body.cpf.replace(/^(\d{3})[\d.-]+(\d{2})$/, "$1.***.***-$2")
      : body.cpf,
  };
}

function getNextFiveDaysISO() {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();

    if (!contaCorrente) {
      return Response.json(
        { error: "INTER_ACCOUNT não configurada no .env" },
        { status: 500 }
      );
    }

    // Dados do request
    const body = await req.json();
    console.log(
      "RECEBIDO EM /api/boletos/create:",
      JSON.stringify(redactBoletoRequest(body), null, 2)
    );

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
      userId,
      secret_key,
    } = body;

    const adminKey = process.env.ADMIN_KEY ?? process.env.NEXT_PUBLIC_ADMIN_KEY;
    const isAdmin = Boolean(adminKey && secret_key === adminKey);

    if (!session && !isAdmin) {
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    const targetUserId = isAdmin ? userId : session?.userId;
    if (!targetUserId) {
      return Response.json(
        { error: "Usuário não informado para gerar cobrança." },
        { status: 400 }
      );
    }

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
    const sanitizedCpf = onlyDigits(cpf);
    const sanitizedCep = onlyDigits(cep);

    if (sanitizedCpf.length !== 11) {
      return Response.json(
        { error: "CPF deve conter 11 dígitos." },
        { status: 400 }
      );
    }

    if (sanitizedCep.length !== 8) {
      return Response.json(
        {
          error: "CEP deve conter 8 dígitos.",
          field: "cep",
          receivedLength: sanitizedCep.length,
        },
        { status: 400 }
      );
    }
    if (!isAdmin && userId && userId !== session?.userId) {
      return Response.json(
        { error: "Usuário inválido para gerar cobrança." },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        cpf: true,
        studyFee: true,
        contracts: {
          where: { status: "SIGNED" },
          orderBy: { signedAt: "desc" },
          take: 1,
          select: { id: true },
        },
      },
    });

    if (!user) {
      return Response.json(
        { error: "Aluno não encontrado para gerar cobrança." },
        { status: 404 }
      );
    }

    // Monta payload da cobrança
    // O usuário solicitou que o seuNumero seja o CPF formatado (ex: 000.000.000-00)
    if (user.contracts.length === 0) {
      return Response.json(
        { error: "Assine o contrato antes de gerar o boleto." },
        { status: 409 }
      );
    }

    if (user.cpf.replace(/\D/g, "") !== sanitizedCpf) {
      return Response.json(
        { error: "CPF inválido para gerar cobrança." },
        { status: 403 }
      );
    }

    const seuNumero = cpf;

    const payload = {
      seuNumero,
      valorNominal: toStudyFeeAmount(user.studyFee),
      dataVencimento: getNextFiveDaysISO(),
      numDiasAgenda: 3,
      pagador: {
        email,
        ddd,
        telefone: onlyDigits(phone),
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

    console.error(
      "ERRO INTER API:",
      JSON.stringify(
        {
          status,
          data: interData,
          message: err?.message,
        },
        null,
        2
      )
    );

    return Response.json(
      {
        error: err?.message ?? "Erro ao criar cobrança no Inter",
        inter: interData,
      },
      { status }
    );
  }
}
