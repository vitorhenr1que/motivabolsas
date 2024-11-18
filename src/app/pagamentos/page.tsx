'use client'
import { useUser } from "../components/contexts/user-provider"
import { stripe } from "../services/stripe"
import { DivDashboard } from "../components/dashboard/DivDashboard"
import { useEffect, useState } from "react"
import styles from './style.module.scss'
import { CiCircleChevDown, CiCircleMore, CiCircleRemove } from "react-icons/ci"
import { FaRegCircleCheck, FaRegCircleXmark } from "react-icons/fa6"
import { IoEllipsisHorizontalCircle } from "react-icons/io5"
import { LuCircleEllipsis } from "react-icons/lu"
import { Loading } from "../components/Loading"



interface User{
    birthDate: Date | null,
    cpf: string,
    createdAt: Date,
    email: string,
    id: string,
    name: string,
    currentPayment: boolean,
    customerId: string
}



export default function Payments(){
    
    const {user} = useUser()
    const [paymentsData, setPaymentsData] = useState<any>()
    const [userData, setUserData] = useState<User | undefined>()
    const [loading, setLoading] = useState(false)
    const [loadingTable, setLoadingTable] = useState(false)
    const [loadingPosition, setLoadingPosition] = useState(0)
    function getDate(num: number){
        const date = new Date(num * 1000)
        const dateOk = date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
        return dateOk
    }

    async function getComprovant(client_secret: string, position: number){
       try {
        setLoading(true)
        setLoadingPosition(position + 1)
        const charge = await stripe.charges.retrieve(client_secret)
        console.log(charge)
        setLoading(false)
        return window.open(`${charge.receipt_url}`)
       }catch(e){
        console.log(e)
        setLoading(false)
       }
    }
    function getStatus(status: string){
        switch(status){
            case 'canceled':
                return (
                    <div className={styles.statusDiv}>
                    <FaRegCircleXmark size={20} color="#e43843"/>
                    <span>Cancelado</span>
                    </div>
                )
                break
            case 'processing': 
            return (
                <div className={styles.statusDiv}>
                    <LuCircleEllipsis size={20} color="#e1a92f"/>
                    <span>Processando</span>
                </div>
            )
            break
            case 'succeeded': 
            return (
                <div className={styles.statusDiv}>
                    <FaRegCircleCheck size={20} color="green"/>
                    <span>Pago</span>
                </div>
            )
            break
            }
        }

    function getAmount(value: number, currency: string){
        const convertedValue = value / 100
        const amount = convertedValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: currency
        })
        return amount
    }
    
    async function PaymentList(){
        try{
            setLoadingTable(true)
            if(user === undefined){
                return
            }
        const payments = await stripe.paymentIntents.list({
            limit: 10,
            customer: user?.customerId
        })
        setPaymentsData(payments.data)
        console.log(payments.data)
        setLoadingTable(false)
        } catch(e){
            console.log(e)
            setLoadingTable(false)
        }
    }
    
    useEffect(()=>{
        console.log('Customer ID: ',user?.customerId)
        PaymentList()
    },[user])
    return(
        <DivDashboard>
            <h1>Pagamentos</h1>
            
            {!!loadingTable ? <Loading/> : 
            <div className={styles.tableContainer}><table className={styles.table}>
                <thead className={styles.thead}>
                    <tr className={styles.tHrow}>
                        <th className={styles.thPayment}>TIPO DE PAGAMENTO</th>
                        <th className={styles.thClient}>CLIENTE</th>
                        <th className={styles.thStatus}>STATUS</th>
                        <th className={styles.thAmount}>VALOR</th>
                        <th className={styles.thCreated}>CRIADO</th>
                        <th className={styles.thComprovant}>COMPROVANTE</th>
                    </tr>
                </thead>
                <tbody className={styles.tbody}>
            {paymentsData && paymentsData.map((index: any, position: number) => {
                console.log(index)
                return (
                    <tr key={index.id} className={styles.tBrow}>
                        <td className={styles.tdPayment}>Renovação de Bolsa</td>
                        <td className={styles.tdClient}>{user?.name}</td>
                        <td className={styles.tdStatus}>{getStatus(index.status)}</td>
                        <td className={styles.tdAmount}>{getAmount(index.amount, index.currency)}</td>
                        <td className={styles.tdCreated}>{getDate(index.created)}</td>
                        <td className={styles.tdButton}><button className={styles.button} disabled={loading} onClick={() => getComprovant(index.latest_charge, position)}>{loading === true && loadingPosition === position + 1 ? <Loading/> : "Ver detalhes"}</button></td>
                                                                                                                                            {/* ID da compra, posição fazendo a condicional para o loading ser individual e não em todos os botões */}
                    </tr>
                    
                )
            })}
                </tbody>
            </table></div>}
        </DivDashboard>
        
    )
} 
