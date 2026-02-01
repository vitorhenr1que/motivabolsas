'use client'

import { api } from "@/app/services/api";
import { userInfo } from "@/app/services/userinfo";
import axios from "axios";
import Link from "next/link"
import { useContext, useEffect, useRef, useState } from "react";
import { PiStudentDuotone } from "react-icons/pi"
import styles from './style.module.scss'
import { CgLogOut } from "react-icons/cg";
import Image from "next/image";
import facilLogo from '../../public/logo.png'
import { IoSettingsOutline } from "react-icons/io5";


import { SignOut } from "@/app/services/logout";
import { useUser } from "../contexts/user-provider";


interface DropDownProfileProps {
    style: string;
}
interface userDataProps {
    birthDate: Date | null,
    cpf: string,
    createdAt: Date,
    email: string,
    id: string,
    name: string,
    currentPayment: boolean,
    customerId: string
}


export function DropdownProfile({ style }: DropDownProfileProps) {
    const [userName, setUserName] = useState<string>('')
    const [toggle, setToggle] = useState(false)
    const { user, setUser } = useUser()
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await api.post('/userinfo')
                setUser(response.data)
                setUserName(response.data.name)
            } catch (e: any) {
                console.log('Falha ao obter os dados do usuário. \nCódigo do erro: ', e.message)
            }
        }
        getUser()

        // Close on outside click
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setToggle(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    function formatDisplayName(originalName: string) {
        if (!originalName) return 'Usuário'
        const nameSplit = originalName.split(' ')
        if (nameSplit.length === 1) return nameSplit[0]

        const first = nameSplit[0]
        const last = nameSplit[nameSplit.length - 1]

        // Tratamento opcional para nomes do meio se for muito curto
        if (nameSplit.length > 2 && nameSplit[0].length < 4) {
            return `${nameSplit[0]} ${nameSplit[1]}`
        }

        return `${first} ${last}`
    }

    function handleSignOut() {
        setUser(undefined)
        SignOut()
    }

    return (
        <div className={styles.dropdownWrapper} ref={dropdownRef}>
            <button
                className={`${styles.profileTrigger} ${toggle ? styles.active : ''}`}
                onClick={() => setToggle(!toggle)}
                title="Menu do Perfil"
            >
                <PiStudentDuotone />
            </button>

            {toggle && (
                <div className={`${styles.menuContainer} ${style}`}>
                    <div className={styles.userHeader}>
                        <div className={styles.avatarCircle}>
                            <PiStudentDuotone size={32} />
                        </div>
                        <div className={styles.userMeta}>
                            <p className={styles.userName}>{formatDisplayName(userName)}</p>
                            <p className={styles.userEmail}>{user?.email}</p>
                        </div>
                    </div>

                    <div className={styles.menuBody}>
                        <Link
                            className={styles.menuItem}
                            href="/dashboard"
                            onClick={() => setToggle(false)}
                        >
                            <div className={styles.iconBox}>
                                <IoSettingsOutline />
                            </div>
                            <div className={styles.itemText}>
                                <strong>Meu Perfil</strong>
                                <span>Painel do aluno</span>
                            </div>
                        </Link>

                        <button className={styles.logoutItem} onClick={handleSignOut}>
                            <div className={styles.iconBox}>
                                <CgLogOut />
                            </div>
                            <span>Sair da conta</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
