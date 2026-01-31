// app/api/inter-token/route.ts
// Rota para gerar access_token do Banco Inter usando mTLS (certificado .crt + chave .key)
//
// Pontos importantes:
// 1) Forçamos runtime Node.js (Edge pode quebrar TLS/FS/crypto).
// 2) Lemos CERT e KEY do .env em BASE64 (linha única), decodificamos para Buffer.
// 3) Montamos um https.Agent com cert/key (mTLS).
// 4) Enviamos o corpo como x-www-form-urlencoded de verdade (URLSearchParams).
// 5) Tratamos erros do axios retornando detalhes úteis.

import axios from "axios";
import https from "https";

export const runtime = "nodejs"; // ✅ garante que isso rode em Node (não Edge)

const clientId = process.env.INTER_CLIENT_ID;
const clientSecret = process.env.INTER_CLIENT_SECRET;
const authUrl = process.env.NEXT_PUBLIC_INTER_AUTH_URL;

// Base64 do .crt e do .key (ideal: SEM quebras de linha)
const sslCertB64 = process.env.SSL_CERT_BASE64;
const sslKeyB64 = process.env.SSL_KEY_BASE64;

export async function POST(_req: Request) {
  try {
    // --- Validações básicas de env ---
    if (!authUrl || !clientId || !clientSecret) {
      return Response.json(
        { error: "Variáveis de ambiente do Inter ausentes (AUTH_URL/CLIENT_ID/CLIENT_SECRET)." },
        { status: 500 }
      );
    }

    if (!sslCertB64 || !sslKeyB64) {
      return Response.json(
        { error: "Certificado/chave não encontrados (SSL_CERT_BASE64 / SSL_KEY_BASE64)." },
        { status: 500 }
      );
    }

    // --- Decodifica Base64 -> Buffer ---
    // .trim() evita problemas se o env tiver \n no final ou espaços acidentais.
    const certBuf = Buffer.from(sslCertB64.trim(), "base64");
    const keyBuf = Buffer.from(sslKeyB64.trim(), "base64");

    // --- Checagem rápida para garantir que decodificou como PEM ---
    // (Ajuda a diagnosticar quando o base64 está quebrado no .env)
    const certPreview = certBuf.toString("utf8", 0, 80);
    const keyPreview = keyBuf.toString("utf8", 0, 80);

    if (!certPreview.includes("BEGIN CERTIFICATE")) {
      return Response.json(
        {
          error:
            "SSL_CERT_BASE64 não parece um PEM válido. Refaça o base64 do .crt em linha única (sem quebras).",
          preview: certPreview,
        },
        { status: 500 }
      );
    }

    if (!keyPreview.includes("BEGIN")) {
      return Response.json(
        {
          error:
            "SSL_KEY_BASE64 não parece um PEM válido. Refaça o base64 do .key em linha única (sem quebras).",
          preview: keyPreview,
        },
        { status: 500 }
      );
    }

    // --- (Opcional) Normaliza CRLF -> LF ---
    // Em alguns casos, o PEM vem com \r\n (Windows) e isso pode dar dor de cabeça.
    // Transformamos em texto, normalizamos e voltamos para Buffer.
    const certClean = certBuf.toString("utf8").replace(/\r\n/g, "\n");
    const keyClean = keyBuf.toString("utf8").replace(/\r\n/g, "\n");

    // --- Cria Agent HTTPS com mTLS ---
    // Aqui é onde o Node/OpenSSL usa seu certificado + chave privada
    // para autenticar no servidor do Inter.
    const agent = new https.Agent({
      cert: Buffer.from(certClean, "utf8"),
      key: Buffer.from(keyClean, "utf8"),
      minVersion: "TLSv1.2", // evita negociar TLS muito antigo
    });

    // --- Monta body real de application/x-www-form-urlencoded ---
    // IMPORTANTE: não é pra mandar objeto JS com esse content-type.
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      scope: "boleto-cobranca.write boleto-cobranca.read",
    });

    // --- Faz request do token ---
    const resp = await axios.post(authUrl, body.toString(), {
      httpsAgent: agent,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      // (Opcional) timeout para não ficar preso em rede
      timeout: 20_000,
    });

    // Retornamos o token (e opcionalmente expires_in/token_type se quiser)
    return Response.json(
      {
        access_token: resp.data?.access_token,
        token_type: resp.data?.token_type,
        expires_in: resp.data?.expires_in,
      },
      { status: 200 }
    );
  } catch (err: any) {
    // --- Tratamento de erro do axios ---
    // Quando o Inter responde com erro, geralmente está em err.response.data
    const status = err?.response?.status ?? 400;
    const interData = err?.response?.data ?? null;

    return Response.json(
      {
        error: err?.message ?? "Erro ao gerar token do Inter",
        inter: interData,
      },
      { status }
    );
  }
}