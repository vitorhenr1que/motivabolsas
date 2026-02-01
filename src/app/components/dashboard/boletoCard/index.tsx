'use client'

import { useState } from 'react';
import styles from './style.module.scss';
import { PiBarcodeBold, PiCopyBold, PiDownloadBold, PiCheckBold } from 'react-icons/pi';
import { api } from '@/app/services/api';
import { getInterToken } from '@/app/services/inter-token';
import { Loading } from '../../Loading';

interface BoletoProps {
    boleto: any;
}

export function BoletoCard({ boleto }: BoletoProps) {
    const [downloading, setDownloading] = useState(false);
    const [copied, setCopied] = useState(false);

    const valor = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(boleto.valorNominal);
    const vencimento = new Date(boleto.dataVencimento).toLocaleDateString('pt-BR');
    const codigoSolicitacao = boleto.codigoSolicitacao;
    // O Inter pode retornar linhaDigitavel dentro de um objeto 'boleto' ou na raiz, dependendo da versão/endpoint
    // Ajuste conforme o retorno real da sua API /boletos/find
    const linhaDigitavel = boleto.linhaDigitavel || boleto.boleto?.linhaDigitavel || 'N/A';

    const handleCopy = () => {
        navigator.clipboard.writeText(linhaDigitavel);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = async () => {
        try {
            setDownloading(true);
            const { access_token } = await getInterToken();

            const response = await api.post('/boletos/pdf', {
                interToken: access_token,
                codigoSolicitacao
            });

            const base64Pdf = response.data?.pdf;
            if (base64Pdf) {
                const linkSource = `data:application/pdf;base64,${base64Pdf}`;
                const downloadLink = document.createElement("a");
                downloadLink.href = linkSource;
                downloadLink.download = `boleto_motiva_${vencimento.replace(/\//g, '-')}.pdf`;
                downloadLink.click();
            } else {
                alert('Não foi possível obter o PDF do boleto. Tente novamente mais tarde.');
            }
        } catch (error) {
            console.error('Erro ao baixar PDF:', error);
            alert('Erro ao baixar o boleto.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className={styles.boletoCard}>
            <div className={styles.header}>
                <PiBarcodeBold className={styles.icon} />
                <h4>Boleto Bancário Gerado</h4>
                <span className={`${styles.status} ${styles.pending}`}>Aguardando Pagamento</span>
            </div>

            <div className={styles.details}>
                <div className={styles.field}>
                    <label>Valor</label>
                    <span>{valor}</span>
                </div>
                <div className={styles.field}>
                    <label>Vencimento</label>
                    <span>{vencimento}</span>
                </div>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label>Linha Digitável</label>
                    <div className={styles.copyGroup}>
                        <input readOnly value={linhaDigitavel} />
                        <button className={styles.copyBtn} onClick={handleCopy} title="Copiar código">
                            {copied ? <PiCheckBold color="#10b981" /> : <PiCopyBold />}
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    className={styles.downloadBtn}
                    onClick={handleDownload}
                    disabled={downloading}
                >
                    {downloading ? <Loading /> : <><PiDownloadBold /> Baixar PDF do Boleto</>}
                </button>
            </div>
        </div>
    );
}
