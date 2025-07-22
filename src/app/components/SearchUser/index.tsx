'use client'
import { api } from "../../../app/services/api"
import { useEffect, useMemo, useState } from "react"
import styles from './style.module.scss'
import { Loading } from "../Loading"
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { PiTrashBold } from "react-icons/pi";

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
renovacao: number,
customerId: string
addresses: addressProps[]
}

interface searchUserProps{
    searchUsers: userDataProps[] | undefined;
    setSearchUsers: React.Dispatch<React.SetStateAction<string | undefined>> | any;
    onlyPaid: boolean;
    adminKey: string;
}

export function SearchUser({searchUsers, setSearchUsers, onlyPaid, adminKey}: searchUserProps){

    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    async function handleClickFind(name: string){
        try{
            setLoading(true)
            
            const response = await api.post('find-users', {  
                secret_key: adminKey,
                onlyPaid: onlyPaid,
                name: searchTerm.toLowerCase()
            })
            setSearchUsers(response.data)
            setLoading(false)
        } catch(e: any){
            console.log(e)
            setLoading(false)
            alert(e.response.data.error)
        }

        
    }
    console.log(searchUsers)
    console.log(searchTerm)
    return(
        <div className={styles.container}>
         <input
        type="text"
        placeholder="Buscar por Nome ou CPF"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.input}
      />
      <button className={styles.findButton} onClick={() => handleClickFind(searchTerm)}>{loading ? <Loading/> : <PiMagnifyingGlassBold size={24}/>}</button>
      <button className={styles.clearButton} onClick={() => setSearchUsers(undefined)}>{<PiTrashBold size={24}/>}</button>
        </div>
    )
}