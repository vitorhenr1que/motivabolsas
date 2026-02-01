import { forwardRef } from 'react'
import styles from './style.module.scss'

interface ReceiptProps {
    data: {
        userName: string;
        userCpf: string;
        amount: number;
        date: string; // Vencimento for now
        description: string;
        code: string; // codigoSolicitacao
    }
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ data }, ref) => {

    function formatCurrency(val: number) {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    function formatDate(dateStr: string) {
        if (!dateStr) return '-'
        const parts = dateStr.split('-')
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`
        }
        return new Date(dateStr).toLocaleDateString('pt-BR')
    }

    const today = new Date().toLocaleDateString('pt-BR');

    return (
        <div className={styles.receiptContainer} ref={ref} id="receipt-template">
            <header className={styles.header}>
                <div className={styles.brand}>
                    <h1>Motiva Bolsas</h1>
                    <span>Programa de Incentivo Estudantil</span>
                </div>
                <div className={styles.receiptTitle}>
                    <h2>Recibo de Pagamento</h2>
                    <p>Emitido em {today}</p>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.amountRow}>
                    <p>Valor Pago</p>
                    <h3>{formatCurrency(data.amount)}</h3>
                </div>

                <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                        <label>Pagador</label>
                        <span>{data.userName}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <label>CPF</label>
                        <span>{data.userCpf}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <label>Referência</label>
                        <span>{data.description}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <label>Data de Vencimento</label>
                        <span>{formatDate(data.date)}</span>
                    </div>
                </div>
            </div>

            <footer className={styles.footer}>
                <div className={styles.authCode}>
                    AUTENTICAÇÃO: {data.code}-{Date.now()}
                </div>
                <p>
                    O pagamento referente à <strong>{data.description}</strong> foi confirmado.
                </p>
            </footer>
        </div>
    )
})

Receipt.displayName = 'Receipt'
