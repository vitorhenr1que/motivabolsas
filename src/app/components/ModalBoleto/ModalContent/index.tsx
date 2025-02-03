import axios from "axios";
import { useState, useEffect } from "react";
import { useUser } from "../../contexts/user-provider";
import { api } from "@/app/services/api";
import { Loading } from "../../Loading";
import styles from './style.module.scss'
import { ButtonGenerate } from "./ButtonGenerate";
import { BoletoViewer } from "../../BoletoViewer";
interface DateSelectorProps{
    initialDate?: string;
}

interface ModalContentProps{
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

export function ModalContent({cpf, sevenNextDays, twoMonthsAgo}: ModalContentProps) {
 

  const [loading, setLoading] = useState(false)
  const [loadingViewBoleto, setLoadingViewBoleto] = useState(false)
  const [cobrancas, setCobrancas] = useState<ApiResponse[] | undefined>()
  const [viewBoleto, setViewBoleto] = useState(false)
  const [pdf, setPdf] = useState('')
  const {interToken, modalUser, codigoSolicitacao} = useUser()


function convertDate(date: string){
    return new Date(date + "T00:00:00Z").toLocaleDateString("pt-BR", {timeZone: "UTC"})
}

async function handleBoletoView(codigoSolicitacao: string){
    setLoadingViewBoleto(true)
    try{
        const response = await api.post('boletos/view', {
            codigoSolicitacao: codigoSolicitacao,
            interToken: interToken
        })
        setPdf(response.data.pdf)
        setLoadingViewBoleto(false)
        return response.data
    }catch(e){
        setLoadingViewBoleto(false)
        console.log('error: ', e)
        return alert(`Erro: ${e}`)
    }
}


useEffect(() => {
    async function getBoletos(){
        setLoading(true)
        try{
            const response = await api.post('boletos/find',{
            interToken: interToken,
            initialDate: twoMonthsAgo,
            finalDate: sevenNextDays,
            cpf: cpf.split(".").join("").split("-").join(""),
           })
            
            console.log(response.data.cobrancas)
            console.log(response.data)
            setCobrancas(response.data.cobrancas)

            setLoading(false)
          }catch(e){
            console.log(e)
            setLoading(false)
          }
    }
       getBoletos()
       
       setLoading(false)
  }, []);

  return loading ? <Loading/> : (
    <div className={styles.container}>
            {cobrancas?.length !== 0 ? cobrancas?.map((index, position) => {
                return(
                    <>
                    <div className={styles.viewBoletoContainer} key={index.cobranca.codigoSolicitacao}>
                        <div className={styles.containerFlexLine}>
                            <div className={styles.solicitationCodeDiv}>
                                <strong>Código de Solicitação: </strong>
                                <span>{index.cobranca.codigoSolicitacao}</span>
                            </div>
                            <div className={styles.valueStatusContainer}>
                                <span>Pagamento em: {index.cobranca.origemRecebimento}</span>
                                <span>Status: {index.cobranca.situacao}</span>
                                <strong>R$ {index.cobranca.valorNominal}</strong>

                            </div>
                        </div>
                        <div className={styles.containerFlexLine}>
                            <div className={styles.dateContainer}>
                                <span>Emissão: {convertDate(index.cobranca.dataEmissao)}</span>
                                <span>Situação: {convertDate(index.cobranca.dataSituacao)}</span>
                                <span>Vencimento: {convertDate(index.cobranca.dataVencimento)}</span>
                            </div>
                            <div >
                             
                            </div>
                            <div>
                                <button className={styles.buttonView} disabled={loadingViewBoleto} onClick={() => handleBoletoView(index.cobranca.codigoSolicitacao)}>{loadingViewBoleto ? <Loading/> : "Visualizar Boleto"}</button>
                            </div>
                            
                        </div>
                    </div>
                    <div className={styles.divViewBoleto}>
                        <BoletoViewer base64={pdf} name={`${modalUser?.name}`}/>
                    </div>
                    </>
                )
            }) : <>
            <div className={styles.viewBoletoContainer}>
               <p>Não há boletos gerados para esse usuário nos últimos 2 meses.</p>
            </div>
            </>
            }
      <ButtonGenerate/>
    </div>
  );
  
}