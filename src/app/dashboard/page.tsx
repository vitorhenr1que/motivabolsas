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

    async function handleComprovante(name: string, course: string, instituition: string, cpf: string, discount: string, createdAt: Date){
        setLoadingButton(true)
        try{
            const response = await api.post('/duplicatedoc',{
                name,
                course,
                instituition,
                cpf,
                discount,
                createdAt
            })
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
                            <span>{`${new Date().getFullYear()}.${new Date().getMonth() + 1 >= 10 || new Date().getMonth() + 1 <= 4 ? 1 : 2 }`}</span>
                        </div>
                        <div className={styles.statusCircle}><IoDocumentText color="lightgreen" size={24}/></div>
                        </div>
                        <hr />
                        <button className={styles.pagamentosButton} onClick={() => {!!user && handleComprovante(user?.name, user?.course, user?.instituition, user?.cpf, user?.discount, user?.createdAt)}}>{loadingButton ? <Loading/> : "Gerar Comprovante"}</button>
                    
                    </div>
                    </div>
                </div>
                } 
       </DivDashboard>
    )
}