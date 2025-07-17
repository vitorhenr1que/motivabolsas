'use client'

import { api } from "../../services/api"
import { useEffect, useState } from "react"
import styles from './style.module.scss'
import { VscVerifiedFilled } from "react-icons/vsc"
import { Loading } from "@/app/components/Loading"
import { IoCloseCircleSharp } from "react-icons/io5"
import { calcularDesconto } from "../../scripts/calcularDesconto"
interface ParamsProps{
    params: {
        id: string,
    }
}

interface User{
    birthDate: Date | null,
    cpf: string,
    createdAt: Date,
    email: string,
    id: string,
    name: string,
    currentPayment: boolean,
    customerId: string,
    course: string,
    instituition: string,
    discount: null | string

}


export default function Consulta({params}: ParamsProps){
    console.log('faculdade/cursos - Params: ', params)
    const [user, setUser] = useState<User>()
    useEffect(() => {
       async function findUser(){
        const response = await api.post('/consultar-usuario', {
            id: params.id
        })
        setUser(response.data)
       }
       findUser()
    },[])
    return user ? (
        <div className={styles.container}>
                <div className={styles.activeContainer}>
                <div className={styles.statusContainer}>
                    <div className={styles.status}>
                        <div className={styles.statusTexts}>
                            <strong>Status da Bolsa:</strong>
                            <span className={!!user?.currentPayment ? styles.spanTrue :styles.spanFalse}>{!!user?.currentPayment ? "Ativo" : "Inativo"}</span>
                        </div>
                        <div className={styles.statusCircle}>{user?.currentPayment ? <VscVerifiedFilled color="lightgreen" size={24}/> : <IoCloseCircleSharp color="#e43843" size={24}/>}
                        </div>
                    </div>
                    <hr />

                    <div className={styles.infoText}>
                        <strong>Nome: </strong>
                        <span>{user?.name}</span>
                    </div>
                    <div className={styles.infoText}>
                        <strong>Curso: </strong>
                        <span>{user?.course}</span>
                    </div>
                    <div className={styles.infoText}>
                        <strong>CPF: </strong>
                        <span>{user?.cpf}</span>
                    </div>
                    <div className={styles.infoText}>
                        <strong>Desconto: </strong>
                        <span>{calcularDesconto(user.course, user.discount)}%</span>
                    </div>
                    <div className={styles.infoText}>
                        <strong>Instituição: </strong>
                        <span>{user.instituition.toUpperCase()}</span>
                    </div>
                </div>
                </div>
                </div>
    ) : <Loading/>
 }