import { api } from '@/app/services/api';
import { BoletoViewer } from '../../BoletoViewer';
import styles from './style.module.scss'
import { FaRegCircleCheck } from "react-icons/fa6";
import { useUser } from '../../contexts/user-provider';
import { useState } from 'react';
import { Loading } from '../../Loading';



export function BoletoGerado(){
    const {codigoSolicitacao, interToken, modalUser} = useUser()
    const [loading, setLoading] = useState(false)
    const [pdf, setPdf] = useState("")
    async function handleBoletoView(){
        setLoading(true)
        try{
            const response = await api.post('boletos/view', {
                codigoSolicitacao: codigoSolicitacao,
                interToken: interToken
            })
            setPdf(response.data.pdf)
            setLoading(false)
            return response.data
        }catch(e){
            setLoading(false)
            console.log('error: ', e)
            return alert(`Erro: ${e}`)
        }
    }
    return(
        <div className={styles.container}>
            <div className={styles.viewBoletoContainer}>
                <FaRegCircleCheck size={140} color='#2093d1'/>
                <p>Boleto gerado com sucesso!</p>
            </div>
            <button className={styles.buttonViewBoleto} disabled={loading} onClick={() => handleBoletoView()}>{loading ? <Loading/> : "Visualizar Boleto"}</button>
            <BoletoViewer base64={pdf} name={`${modalUser?.name}`}/>
        </div>
        
    )
}