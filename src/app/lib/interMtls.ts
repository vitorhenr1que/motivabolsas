// lib/interMtls.ts
// Centraliza a criação do https.Agent para mTLS (Banco Inter).
// Assim você não duplica lógica e evita bugs de certificado em cada rota.

import https from "https";

export function createInterHttpsAgent() {
  const sslCertB64 = process.env.SSL_CERT_BASE64;
  const sslKeyB64 = process.env.SSL_KEY_BASE64;

  if (!sslCertB64 || !sslKeyB64) {
    throw new Error("Certificado/chave não encontrados (SSL_CERT_BASE64 / SSL_KEY_BASE64).");
  }

  // 1) trim() evita quebras de linha/espacos no fim do env
  // 2) base64 -> Buffer (bytes do PEM)
  const certBuf = Buffer.from(sslCertB64.trim(), "base64");
  const keyBuf = Buffer.from(sslKeyB64.trim(), "base64");

  // Checagem rápida: confirma que é PEM mesmo (ajuda em debug)
  const certPreview = certBuf.toString("utf8", 0, 80);
  const keyPreview = keyBuf.toString("utf8", 0, 80);

  if (!certPreview.includes("BEGIN CERTIFICATE")) {
    throw new Error("SSL_CERT_BASE64 não parece PEM válido (BEGIN CERTIFICATE).");
  }
  if (!keyPreview.includes("BEGIN")) {
    throw new Error("SSL_KEY_BASE64 não parece PEM válido (BEGIN ... KEY).");
  }

  // Normaliza CRLF -> LF (Windows), evita problemas de parse
  const certClean = certBuf.toString("utf8").replace(/\r\n/g, "\n");
  const keyClean = keyBuf.toString("utf8").replace(/\r\n/g, "\n");

  // Cria agent mTLS: o Node vai apresentar o cert + key para o Inter
  return new https.Agent({
    cert: Buffer.from(certClean, "utf8"),
    key: Buffer.from(keyClean, "utf8"),
    minVersion: "TLSv1.2",
  });
}