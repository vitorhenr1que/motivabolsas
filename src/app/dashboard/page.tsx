'use client'
import { useEffect, useState } from "react";
import PaymentButton from "../components/dashboard/paymentButton";
import { api } from "../services/api";
import styles from './style.module.scss'
import Link from "next/link";
import { MdOutlineLogout } from "react-icons/md";
import { stripe } from "../services/stripe";
import { SignOut } from "../services/logout";
import { DivDashboard } from "../components/dashboard/DivDashboard";
import { Loading } from "../components/Loading";
import { VscVerifiedFilled } from "react-icons/vsc";
import { InfoPayContainer } from "../components/InfoPayContainer";
import { IoDocumentText } from "react-icons/io5";
import { calcularSemestre } from "../scripts/calcularSemestre";

interface userDataProps{
        birthDate: Date | null,
        cpf: string,
        createdAt: Date,
        email: string,
        id: string,
        name: string,
        instituition: string,
        course: string,
        discount: string,
        currentPayment: boolean,
        firstPayment: boolean,
        customerId: string
}

export default function Dashboard(){
    const [user, setUser] = useState<userDataProps>()
    const [loading, setLoading] = useState(true)
    const [loadingButton, setLoadingButton] = useState(false)
    useEffect(()=> {
        setLoading(true)
        const getUser = async () => {
            const response = await api.post('/userinfo').then(res => {
                setUser(res.data)
            setLoading(false)
            }).catch(e => console.log('Falha ao obter os dados do usuário. \nO e-mail não foi fornecido. \nCódigo do erro: ', e.message))
             
        } 
        getUser()
        
    }, [])
    console.log(user?.currentPayment)

    async function handleDownloadComprovante(){
        setLoadingButton(true)
        try{
            const response = await api.post('/download-comprovante',{
                name: user?.name,
                course: user?.course,
                instituition: user?.instituition,
                cpf: user?.cpf,
                discount: user?.discount,
                createdAt: user?.createdAt,
                id: user?.id
            }, {
                responseType: 'blob'
            })
            // Criar Blob diretamente do arquivo PDF
            const blob = new Blob([response.data], { type: 'application/pdf' });

            // recuperar o ID do novo documento via headers
            const newDocumentId = response.headers['x-document-id'];
            console.log('Novo documento Google Docs criado com ID:', newDocumentId);

            // Criar URL para download do Blob
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `Comprovante de Bolsa - Motiva Bolsas (${user?.instituition.toUpperCase()})`;
            a.click();
            URL.revokeObjectURL(url);

            setLoadingButton(false)
            return response
        }catch(e){
            setLoadingButton(false)
            return console.log(e)
        }
    }

    return !!loading ? 
        <DivDashboard>
            <Loading/>
        </DivDashboard>
        : (
       <DivDashboard>
                { user?.currentPayment === false ? 
                <InfoPayContainer firstPayment={user?.firstPayment}/>
                
                : 
                <div className={styles.container}>
                <div className={styles.activeContainer}>
                <div className={styles.statusContainer}>
                    <div className={styles.status}>
                        <div className={styles.statusTexts}>
                            <strong>Status da Bolsa:</strong>
                            <span>Ativo</span>
                        </div>
                        <div className={styles.statusCircle}><VscVerifiedFilled color="lightgreen" size={24}/></div>
                    </div>
                    <hr />
                    <Link href={"/pagamentos"} className={styles.pagamentosButton}>Lista de Pagamentos</Link>
                </div>
                </div>
                    <div className={styles.activeContainer}>
                    <div className={styles.statusContainer}>
                    <div className={styles.status}>
                        <div className={styles.statusTexts}>
                            <strong>Comprovante de Bolsa</strong>
                            <span>{`${calcularSemestre(new Date())}`}</span>
                        </div>
                        <div className={styles.statusCircle}><IoDocumentText color="lightgreen" size={24}/></div>
                        </div>
                        <hr />
                        <button className={styles.pagamentosButton} onClick={() => {!!user && handleDownloadComprovante()}}>{loadingButton ? <Loading/> : "Gerar Comprovante"}</button>
                    
                    </div>
                    </div>
                </div>
                } 
       </DivDashboard>
    )
}