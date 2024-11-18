'use client'

import { api } from "@/app/services/api";
import { userInfo } from "@/app/services/userinfo";
import axios from "axios";
import Link from "next/link"
import { useContext, useEffect, useState } from "react";
import { PiStudentDuotone } from "react-icons/pi"
import styles from './style.module.scss'
import { CgLogOut } from "react-icons/cg";
import Image from "next/image";
import facilLogo from '../../public/logo.png'
import { IoSettingsOutline } from "react-icons/io5";


import { SignOut } from "@/app/services/logout";
import { useUser } from "../contexts/user-provider";


interface DropDownProfileProps{
    style: string;
}
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


export function DropdownProfile({style}: DropDownProfileProps){


    
    const [userName, setUserName] = useState<any>()
    const [toggle, setToggle] = useState(false)
    const { user, setUser } = useUser()
    console.log('Dropdown: ', user)
    useEffect(()=> {
        const getUser = async () => {
            const response = await api.post('/userinfo').then(res => {
                setUser(res.data)
                console.log('Nome aq', res.data.name)
                setUserName(res.data.name)
            }).catch(e => console.log('Falha ao obter os dados do usuário. \nO e-mail não foi fornecido. \nCódigo do erro: ', e.message))
             
        } 
        getUser()
    },[])

   

    function getUserName(){ //tratar nomes com, de, dos, das
        const userNameCompiled = userName.split(' ')
        const compNames = ['do', 'dos', 'da', 'das', 'de']
        if(compNames.includes(userNameCompiled[1])){
            return `${userNameCompiled[0]} ${userNameCompiled[1]} ${userNameCompiled[2]}`
        }
        return `${userNameCompiled[0]} ${userNameCompiled[1]}`
    }

    function handleSignOut(){
        setUser(undefined)
        SignOut()
    }



    console.log('teste: ',userName)
    return(
        <div className={styles.dropdownContainer}>
        <button className={styles.buttonDiv} onClick={() => setToggle(!toggle)}>
            <PiStudentDuotone size={35}/>
        </button>
       
        <div className={!!toggle ? style : styles.container}>
           <div className={styles.userInfoContainer}>
                <div className={styles.avatarDiv}>
                    <PiStudentDuotone size={35}/>
                </div>
                <div className={styles.nameEmail}>
                        <strong>{userName && getUserName()}</strong>
                        <span>{user?.email}</span>
                </div>
                <Link className={styles.viewProfile} href={"/dashboard"}>VER PERFIL</Link>
           </div>
           <hr className={styles.hr}/>
           <div className={styles.userLinks}>
            <IoSettingsOutline size={32}/>
            <div className={styles.myAccount}>
                <strong>Minha conta</strong>
                <span>Gerencie dados e preferências</span>
            </div>
           </div>
           <hr className={styles.hr}/>
           <button className={styles.logoutButton} onClick={() => handleSignOut()}>
            <CgLogOut size={32}/>
            <span>Sair da conta</span>
           </button>
        </div>
        
    </div>
    )
}