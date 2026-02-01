'use client'
import { useUser } from "../components/contexts/user-provider"
import { api } from "../services/api"
import { DivDashboard } from "../components/dashboard/DivDashboard"
import { useEffect, useState } from "react"
import styles from './style.module.scss'
import { Loading } from "../components/Loading"
import { getInterToken } from "../services/inter-token"
import {
    PiCheckCircleFill,
    PiReceiptBold,
    PiCreditCardBold,
    PiDownloadSimpleBold,
} from "react-icons/pi"

interface Boleto {
    cobranca: {
        codigoSolicitacao: string;
        dataEmissao: string;
        dataVencimento: string;
        valorNominal: number;
        situacao: string;
        valorTotalRecebido?: number;
    }
}

interface ReceiptData {
    code: string;
    amount: number;
    status: string;
    method: string;
    payerName: string;
    lastUpdate: string;
    startedAt: string;
    succeededAt: string;
    description: string;
}

export default function Payments() {
    const { user } = useUser()
    const [boletosData, setBoletosData] = useState<Boleto[]>([])
    const [loadingTable, setLoadingTable] = useState(false)
    const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null)

    // Buscar todos os boletos desde a criação da conta
    useEffect(() => {
        if (user?.cpf && user?.createdAt) {
            const createdDate = new Date(user.createdAt)
            const today = new Date()

            const startDate = createdDate.toISOString().split('T')[0];
            const endDate = today.toISOString().split('T')[0];

            fetchBoletos(startDate, endDate)
        }
    }, [user?.cpf, user?.createdAt])

    async function fetchBoletos(startDate: string, endDate: string) {
        if (!user?.cpf) return
        try {
            setLoadingTable(true)
            const { access_token } = await getInterToken()

            const response = await api.post('/boletos/find', {
                interToken: access_token,
                cpf: user.cpf,
                initialDate: startDate,
                finalDate: endDate
            })

            const cobrancas = response.data?.cobrancas || []

            // Filtrar apenas boletos RECEBIDOS
            const pagos = cobrancas.filter((item: Boleto) =>
                item.cobranca.situacao === "RECEBIDO" ||
                item.cobranca.situacao === "MARCADO_RECEBIDO"
            )

            // Ordenar por data de vencimento (mais recente primeiro)
            pagos.sort((a: Boleto, b: Boleto) =>
                new Date(b.cobranca.dataVencimento).getTime() - new Date(a.cobranca.dataVencimento).getTime()
            )

            setBoletosData(pagos)
        } catch (e) {
            console.error('Erro ao buscar boletos:', e)
        } finally {
            setLoadingTable(false)
        }
    }

    async function handleGenerateReceipt(item: Boleto) {
        if (!user) return
        try {
            const code = item.cobranca.codigoSolicitacao
            setDownloadingPdf(code)

            const receiptData: ReceiptData = {
                code: code,
                amount: item.cobranca.valorTotalRecebido || item.cobranca.valorNominal,
                status: "SUCESSO",
                method: "Boleto Bancário",
                payerName: user.name,
                lastUpdate: new Date().toISOString(),
                startedAt: item.cobranca.dataEmissao,
                succeededAt: item.cobranca.dataVencimento,
                description: getPaymentDescription(item.cobranca.dataVencimento)
            }

            const response = await fetch('/api/pdf/comprovante', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(receiptData),
            })

            if (!response.ok) throw new Error('Falha ao gerar o PDF')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Comprovante_Motiva_${code}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

        } catch (error) {
            console.error('Erro ao baixar recibo:', error)
            alert('Erro ao baixar o comprovante.')
        } finally {
            setDownloadingPdf(null)
        }
    }

    function formatDate(dateStr: string) {
        if (!dateStr) return '-'
        const parts = dateStr.split('-')
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`
        }
        return new Date(dateStr).toLocaleDateString('pt-BR')
    }

    function formatCurrency(val: number) {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    function getPaymentDescription(dateStr: string) {
        if (!dateStr) return 'Pagamento Semestral'
        const parts = dateStr.split('-')
        if (parts.length === 3) {
            const year = parts[0]
            const month = parseInt(parts[1], 10)
            const semester = month <= 6 ? 1 : 2
            return `Pagamento Semestral ${year}.${semester}`
        }
        return `Pagamento Semestral`
    }

    return (
        <DivDashboard>
            <div className={styles.paymentsWrapper}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className={styles.title}>
                        <h1>Histórico de Pagamentos</h1>
                        <p>Acompanhe suas mensalidades e baixe seus recibos.</p>
                    </div>
                </header>

                {loadingTable ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <Loading />
                    </div>
                ) : boletosData.length > 0 ? (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr>
                                    <th>Serviço / Descrição</th>
                                    <th>Status</th>
                                    <th>Valor</th>
                                    <th>Vencimento</th>
                                    <th style={{ textAlign: 'center' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {boletosData.map((item) => (
                                    <tr key={item.cobranca.codigoSolicitacao} className={styles.tBrow}>
                                        <td className={styles.tdPayment}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '8px', borderRadius: '8px', color: '#16a34a' }}>
                                                    <PiReceiptBold size={20} />
                                                </div>
                                                <div>
                                                    <strong>{getPaymentDescription(item.cobranca.dataVencimento)}</strong>
                                                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Ref: {item.cobranca.codigoSolicitacao}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={styles.tdStatus}>
                                            <div className={`${styles.statusBadge} ${styles.succeeded}`}>
                                                <PiCheckCircleFill />
                                                <span>Pago</span>
                                            </div>
                                        </td>
                                        <td className={styles.tdAmount}>{formatCurrency(item.cobranca.valorTotalRecebido || item.cobranca.valorNominal)}</td>
                                        <td className={styles.tdCreated}>{formatDate(item.cobranca.dataVencimento)}</td>
                                        <td className={styles.tdButton}>
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                <button
                                                    className={styles.detailsBtn}
                                                    disabled={downloadingPdf === item.cobranca.codigoSolicitacao}
                                                    onClick={() => handleGenerateReceipt(item)}
                                                    title="Baixar comprovante"
                                                >
                                                    {downloadingPdf === item.cobranca.codigoSolicitacao ? (
                                                        <Loading />
                                                    ) : (
                                                        <>
                                                            <PiDownloadSimpleBold />
                                                            <span>Recibo PDF</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <PiCreditCardBold />
                        <h3>Nenhum pagamento encontrado</h3>
                        <p>Nenhum pagamento foi encontrado.</p>
                    </div>
                )}
            </div>
        </DivDashboard>
    )
}
