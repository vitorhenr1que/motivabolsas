import axios from "axios";
import { useState, useEffect } from "react";
import { useUser } from "../../contexts/user-provider";
import { api } from "@/app/services/api";
import { Loading } from "../../Loading";
import styles from './style.module.scss'
import { ButtonGenerate } from "./ButtonGenerate";
import { BoletoViewer } from "../../BoletoViewer";
import { PiBarcode, PiFilePdf, PiCalendarBlank, PiMoney, PiCheckCircle, PiWarningCircle, PiXCircle, PiClock } from "react-icons/pi";

interface DateSelectorProps {
  initialDate?: string;
}

interface ModalContentProps {
  cpf: string;
  sevenNextDays: string;
  twoMonthsAgo: string;
}

interface Boleto {
  codigoBarras: string;
  linhaDigitavel: string;
  nossoNumero: string;
}

interface Pagador {
  nome: string;
  cpfCnpj: string;
}

interface Cobranca {
  codigoSolicitacao: string;
  dataEmissao: string;
  dataSituacao: string;
  dataVencimento: string;
  origemRecebimento: string;
  pagador: Pagador;
  seuNumero: string;
  situacao: string;
  tipoCobranca: string;
  valorNominal: string;
  valorTotalRecebido: string;
}

interface Pix {
  pixCopiaECola: string;
  txid: string;
}

interface ApiResponse {
  boleto: Boleto;
  cobranca: Cobranca;
  pix: Pix;
}

export function ModalContent({ cpf, sevenNextDays, twoMonthsAgo }: ModalContentProps) {


  const [loading, setLoading] = useState(false)
  const [loadingViewBoleto, setLoadingViewBoleto] = useState('')
  const [cobrancas, setCobrancas] = useState<ApiResponse[] | undefined>()
  const [viewBoleto, setViewBoleto] = useState('')
  const [pdf, setPdf] = useState('')
  const { interToken, modalUser, codigoSolicitacao } = useUser()


  function convertDate(date: string) {
    if (!date) return '-';
    // Handle YYYY-MM-DD
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  const formatCurrency = (value: string | number) => {
    const num = Number(value);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(isNaN(num) ? 0 : num);
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAGO':
      case 'RECEBIDO':
        return styles.paid;
      case 'EM ABERTO':
      case 'A VENCER':
        return styles.pending;
      case 'VENCIDO':
        return styles.overdue;
      case 'CANCELADO':
        return styles.canceled;
      default:
        return styles.pending;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAGO':
      case 'RECEBIDO':
        return <PiCheckCircle size={16} />;
      case 'EM ABERTO':
      case 'A VENCER':
        return <PiClock size={16} />;
      case 'VENCIDO':
        return <PiWarningCircle size={16} />;
      case 'CANCELADO':
        return <PiXCircle size={16} />;
      default:
        return <PiClock size={16} />;
    }
  };

  async function handleBoletoView(codigoSolicitacao: string) {
    // Toggle close if already open
    if (viewBoleto === codigoSolicitacao) {
      setViewBoleto('');
      return;
    }

    setLoadingViewBoleto(codigoSolicitacao)
    setViewBoleto(codigoSolicitacao)
    try {
      const response = await api.post('boletos/view', {
        codigoSolicitacao: codigoSolicitacao,
        interToken: interToken
      })
      setPdf(response.data.pdf)
      setLoadingViewBoleto('')
      return response.data
    } catch (e) {
      setLoadingViewBoleto('')
      console.log('error: ', e)
      return alert(`Erro: ${e}`)
    }
  }


  useEffect(() => {
    async function getBoletos() {
      setLoading(true)

      try {
        const response = await api.post('boletos/find', {
          interToken: interToken,
          initialDate: twoMonthsAgo,
          finalDate: sevenNextDays,
          cpf: cpf.split(".").join("").split("-").join(""),
        })

        console.log(response.data.cobrancas)
        console.log(response.data)
        setCobrancas(response.data.cobrancas)

        setLoading(false)
      } catch (e) {
        console.log(e)
        setLoading(false)
      }
    }
    getBoletos()

    setLoading(false)
  }, []);

  return loading ? <Loading /> : (
    <div className={styles.container}>
      {cobrancas && cobrancas.length > 0 ? cobrancas.map((item, position) => {
        return (
          <div key={item.cobranca.codigoSolicitacao}>
            <div className={styles.boletoCard}>
              <div className={styles.header}>
                <div className={styles.codeGroup}>
                  <span className={styles.label}>Código Solicitação</span>
                  <span className={styles.value}>
                    <PiBarcode size={16} />
                    {item.cobranca.codigoSolicitacao}
                  </span>
                </div>
                <div className={`${styles.statusBadge} ${getStatusStyle(item.cobranca.situacao)}`}>
                  {getStatusIcon(item.cobranca.situacao)}
                  {item.cobranca.situacao}
                </div>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.label}><PiMoney size={16} /> Valor</span>
                  <span className={`${styles.value} ${styles.highlight}`}>
                    {formatCurrency(item.cobranca.valorNominal)}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}><PiCalendarBlank size={16} /> Vencimento</span>
                  <span className={styles.value}>
                    {convertDate(item.cobranca.dataVencimento)}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Emissão</span>
                  <span className={styles.value}>
                    {convertDate(item.cobranca.dataEmissao)}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Origem</span>
                  <span className={styles.value}>
                    {item.cobranca.origemRecebimento || 'Boleto'}
                  </span>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.buttonView}
                  disabled={loadingViewBoleto === item.cobranca.codigoSolicitacao}
                  onClick={() => handleBoletoView(item.cobranca.codigoSolicitacao)}
                >
                  {loadingViewBoleto === item.cobranca.codigoSolicitacao ?
                    <Loading /> :
                    <>
                      <PiFilePdf size={18} />
                      {viewBoleto === item.cobranca.codigoSolicitacao ? "Fechar Visualização" : "Visualizar Boleto/Pix"}
                    </>
                  }
                </button>
              </div>
            </div>

            {viewBoleto === item.cobranca.codigoSolicitacao && (
              <div className={styles.divViewBoleto}>
                <BoletoViewer base64={pdf} name={`${modalUser?.name}`} />
              </div>
            )}
          </div>
        )
      }) : (
        <div className={styles.emptyState}>
          <PiWarningCircle size={48} />
          <p>Não há boletos gerados para esse usuário nos últimos 2 meses.</p>
        </div>
      )}
      {/* <ButtonGenerate/>  -- Commented out or kept based on original req? Original had it. Keep it.*/}
      <ButtonGenerate />
    </div>
  );

}