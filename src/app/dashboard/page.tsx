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

interface userDataProps{
        birthDate: Date | null,
        cpf: string,
        createdAt: Date,
        email: string,
        id: string,
        name: string,
        currentPayment: boolean,
        customerId: string
}

export default function Dashboard(){
    const [user, setUser] = useState<userDataProps>()
    const [loading, setLoading] = useState(true)
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


    return !!loading ? 
        <DivDashboard>
            <Loading/>
        </DivDashboard>
        : (
       <DivDashboard>
                { user?.currentPayment === false ? 
                <div className={styles.infoPayContainer}>
                    <span>A sua bolsa não foi renovada para esse semestre. Efetue o pagamento para renova-la.</span>
                    <PaymentButton user={user}/>
                </div> 
                : 
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
                </div> }
       </DivDashboard>
    )
}