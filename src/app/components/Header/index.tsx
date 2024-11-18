

import Image from 'next/image'
import styles from './style.module.scss'
import facilLogo from '../../public/logo.png'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { DropdownProfile } from '../dropdownProfile'
import { useState } from 'react'
import { IoMenu } from 'react-icons/io5'
import { ToggleMenu } from '../ToggleMenu'


export async function Header(){
    const isLogged = cookies().get("Authorization")

    console.log('IS LOGGED: ', isLogged)
    

    return (
        <div className={styles.headerContainer}>
            <nav className={styles.navContainer}>
                    <div className={styles.toggleAndLogoContainer}>
                    <ToggleMenu isLogged={!!isLogged}/>
                    <Link href={"/"} className={styles.logo}>
                        <Image src={facilLogo} className={styles.logoImage} alt='' height={60}/>
                    </Link>
                </div>
                
                <ul className={styles.ulContainer}>

                    {
                        !!isLogged === true && isLogged.value !== "invalid" ? 
                        <li className={styles.loggedButton}>
                            <DropdownProfile style={styles.dropdownDiv}/> 
                        </li>
                         : 
                         <>
                        <li>
                        <Link href="/login" className={styles.signInButton}>Entrar</Link>
                        </li>
                        <li>
                        <Link href="/create" className={styles.signUpButton}>Inscreva-se</Link>
                        </li>
                        </>
                    }
                </ul>
            </nav>
        </div>
            
    )
}