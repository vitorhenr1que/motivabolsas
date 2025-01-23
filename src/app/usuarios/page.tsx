'use client'

import { FormEvent, useEffect, useState } from "react"
import styles from './style.module.scss'
import { api } from "../services/api"
import { MdKeyboardArrowDown } from "react-icons/md";
import { LuCopy } from "react-icons/lu";
import { LuCopyCheck } from "react-icons/lu";
import { InfoCamp } from "../components/InfoCamp";


interface addressProps{
        cep: string,
        city: string,
        complement: string,
        id: string,
        neighborhood: string,
        number: string,
        street: string,
        uf: string,
        userId: string
}

interface userDataProps{
    birthDate: Date | null,
    cpf: string,
    createdAt: Date,
    email: string,
    id: string,
    name: string,
    phone: string,
    currentPayment: boolean,
    customerId: string
    addresses: addressProps[]
}

export default function Usuarios(){
const [adminKey, setAdminKey] = useState("")
const [actualPage, setActualPage] = useState(0)
const [users, setUsers] = useState<userDataProps[]>()
const [showInformation, setShowInformation] = useState<String>("")
const response = [1,2,3,4,5,6,7,8,9,10]



function humanizedDate(createdDate: string){
const date = new Date(createdDate);

const formatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const humanizedDate = formatter.format(date);

return humanizedDate
}

console.log(users)
    async function handleClickFind(page: number){
        try{
            const response = await api.post('usuarios', {
                secret_key: adminKey,
                page: page
            })
            
            setUsers(response.data)
            console.log(response)
        } catch(e: any){
            console.log(e)
        }

        
    }


    async function handleClickPagination( page: number){
        setActualPage(page)
        handleClickFind(page)
        }


    return (
        <div className={styles.container}>
            <h1>Lista de Usuários</h1>
            <div className={styles.inputContainer}>
                <input type="text" placeholder="Digite a chave de admnistrador" onChange={(e) => setAdminKey(e.target.value)} />
                <button onClick={() => handleClickFind(actualPage)}>
                    Mostrar usuários
                </button>
            </div>
            <div className={styles.userList}>
                {users !== undefined && <div className={styles.userListContainer}>{users.map((index, position) => {
                    return (
                        <div key={index.id} className={styles.userContainer}>
                            <div className={styles.userSimpleContainer}>
                                <div className={styles.spanContainer}>
                                    <span className={styles.name}>{index.name.toLocaleUpperCase()}</span>
                                    <span className={styles.cpf}>{index.cpf}</span>
                                </div>
                                <button className={styles.showButton} onClick={() => setShowInformation(index.id)}><MdKeyboardArrowDown size={24}/><span>Mostrar Informações</span></button>
                            </div>
                            {showInformation === index.id && <div className={styles.showInformationContainer}>
                            
                            <InfoCamp campName={"Id: "} campValue={index.id} />
                            <InfoCamp campName={"Nome: "} campValue={index.name} />
                            <InfoCamp campName={"CPF: "} campValue={index.cpf} />
                            <InfoCamp campName={"E-mail: "} campValue={index.email} />
                            <InfoCamp campName={"Telefone: "} campValue={index.phone} />
                            <InfoCamp campName={"Rua: "} campValue={index.addresses[0].street} />
                            <InfoCamp campName={"Número: "} campValue={index.addresses[0].number} />
                            <InfoCamp campName={"Complemento: "} campValue={index.addresses[0].complement} />
                            <InfoCamp campName={"Bairro: "} campValue={index.addresses[0].neighborhood} />
                            <InfoCamp campName={"CEP: "} campValue={index.addresses[0].cep} />
                            <InfoCamp campName={"Cidade: "} campValue={index.addresses[0].city} />
                            <InfoCamp campName={"Identificação Stipe: "} campValue={index.customerId} />
                            <p><strong>Status da Bolsa: </strong><span className={index.currentPayment === true ? styles.statusActive : styles.statusInactive}>{index.currentPayment === true ? "Ativo" : "Inativo"}</span></p>
                            <p><strong>Cadastro: </strong><span>{humanizedDate(`${index.createdAt}`)}</span></p>
                        </div>}
                        </div>
                        
                    )
                })}</div>}
            </div>
            <ul className={styles.paginationContainer}>
                {users !== undefined && response.map((index: number, position: number) => {
                    return(
                        <li className={styles.paginationItem} key={position}>
                            <button onClick={() => handleClickPagination(position)} className={actualPage === position ? styles.paginationButtonActive : styles.paginationButton}>{index}</button>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}