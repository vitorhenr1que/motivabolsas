import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import crypto from "crypto";

export function sha256(data: Uint8Array) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function maskCpf(cpf?: string | null) {
  if (!cpf) return undefined;
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return "***.***.***-**";
  return `***.***.***-${digits.slice(-2)}`;
}

type EvidenceData = {
  evidenceId: string;
  contractId: string;
  contractTitle: string;
  contractVersion: number;
  originalPdfHash: string;
  signedAtISO: string;

  signer: {
    userId: string;
    name?: string;
    email?: string;
    cpfMasked?: string;
  };

  device: {
    ip?: string;
    userAgent?: string;
  };

  consentText: string;
};

export async function appendEvidencePage(
  originalPdfBytes: Uint8Array,
  data: EvidenceData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalPdfBytes);

  const page = pdfDoc.addPage();
  const { height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  let y = height - margin;

  const drawTitle = (text: string) => {
    page.drawText(text, { x: margin, y, size: 16, font: fontBold, color: rgb(0, 0, 0) });
    y -= 28;
  };

  const drawLine = (label: string, value?: string) => {
    const v = value ?? "-";
    page.drawText(`${label}: ${v}`, { x: margin, y, size: 11, font, color: rgb(0, 0, 0) });
    y -= 16;
  };

  const drawParagraph = (text: string) => {
    const maxChars = 95;
    for (let i = 0; i < text.length; i += maxChars) {
      const line = text.slice(i, i + maxChars);
      page.drawText(line, { x: margin, y, size: 10, font, color: rgb(0, 0, 0) });
      y -= 14;
    }
    y -= 6;
  };

  drawTitle("EVIDÊNCIAS DE ASSINATURA ELETRÔNICA");

  drawLine("ID da evidência", data.evidenceId);
  drawLine("Contrato", `${data.contractTitle} (ID: ${data.contractId})`);
  drawLine("Versão", String(data.contractVersion));
  drawLine("Data/Hora (servidor)", data.signedAtISO);

  y -= 6;
  drawLine("Usuário (ID)", data.signer.userId);
  drawLine("Nome", data.signer.name);
  drawLine("E-mail", data.signer.email);
  drawLine("CPF", data.signer.cpfMasked);

  y -= 6;
  drawLine("IP", data.device.ip);
  drawLine("User-Agent", data.device.userAgent);

  y -= 6;
  drawLine("Hash SHA-256 do PDF original", data.originalPdfHash);

  y -= 10;
  page.drawText("Declaração de consentimento:", { x: margin, y, size: 11, font: fontBold });
  y -= 18;
  drawParagraph(data.consentText);

  page.drawText("Registro gerado automaticamente pelo sistema.", {
    x: margin,
    y: margin,
    size: 9,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  return await pdfDoc.save();
}
