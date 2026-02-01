import Link from "next/link";
import { useState, useEffect } from "react";
import styles from './style.module.scss'
import { PiFilePdfBold, PiDownloadSimpleBold } from "react-icons/pi";

interface BoletoViewerProps {
  base64: string;
  name: string;
  codigo?: string;
}

export function BoletoViewer({ base64, name, codigo }: BoletoViewerProps) {
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    if (base64) {
      try {
        const byteCharacters = atob(base64);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);

        return () => {
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error("Erro ao processar o PDF Base64:", error);
      }
    }
  }, [base64]);

  if (!pdfUrl) return null;

  return (
    <div className={styles.container}>
      <div className={styles.actionsRow}>
        <Link
          className={`${styles.btnAction} ${styles.outline}`}
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <PiFilePdfBold />
          Abrir em nova aba
        </Link>

        <Link
          className={`${styles.btnAction} ${styles.primary}`}
          href={pdfUrl}
          download={`Boleto_Motiva_${name.split(' ')[0]}_${codigo || 'ref'}.pdf`}
          target="_blank"
        >
          <PiDownloadSimpleBold />
          Baixar PDF
        </Link>
      </div>
    </div>
  );
};
