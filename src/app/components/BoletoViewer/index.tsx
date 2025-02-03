import Link from "next/link";
import { useState, useEffect } from "react";
import styles from './style.module.scss'

interface BoletoViewerProps {
    base64: string;
    name: string;
  }

export function BoletoViewer({ base64, name }: BoletoViewerProps) {
  const [pdfUrl, setPdfUrl] = useState("");
  
  useEffect(() => {
    if (base64) {
      try {
        // 1. Decodifica o Base64 para uma string binária
        const byteCharacters = atob(base64);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        // 2. Converte para um array de bytes
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        // 3. Cria um Blob com os bytes do PDF
        const blob = new Blob([byteNumbers], { type: "application/pdf" });
        // 4. Cria um URL temporário para acessar o PDF
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error("Erro ao processar o PDF Base64:", error);
      }
    }
  }, [base64]);

  return (
    <>
      {pdfUrl && (
        <div className={styles.container}>
          <Link className={styles.boletoUrl} href={pdfUrl} target="_blank" rel="noopener noreferrer">
            📄 Abrir Boleto em Nova Aba
          </Link>
          <Link className={styles.boletoUrl} href={pdfUrl} target="_blank" download={`${name.toUpperCase().split(' ').join('_')}-Motiva_Bolsas.pdf`}>
            📥 Baixar Boleto
          </Link>
        </div>
      )}
    </>
  );
};