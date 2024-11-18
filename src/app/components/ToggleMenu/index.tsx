'use client'
import { IoMenu } from "react-icons/io5";
import styles from './style.module.scss'
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MdOutlineLogout } from "react-icons/md";

interface isLoggedProps{
    isLogged: boolean;
}

export function ToggleMenu({isLogged}: isLoggedProps){
    const [toggle, setToggle] = useState(false)

    function handleToggleClick(){
        setToggle(false)
    }


    
    


    return (
        <div>
        <button className={styles.toggleButton} onClick={() => setToggle(!toggle)}>
            <IoMenu size={30} color='#ececec'/>
         </button>
         {toggle && 
         <div className={toggle ? styles.dropDownMenuActive : styles.dropDownMenuInactive}>
            <div className={styles.menuSection}>
                <span>Menu</span>
                <hr/>
            </div>
            <div className={styles.loggedLinks}>
                <Link href={"/"} className={styles.link} onClick={() => handleToggleClick()}>
                        Inicio
                    </Link>
                    <Link href={"#"} className={styles.link} onClick={() => handleToggleClick()}>
                        Contato
                    </Link>
                </div>
            {isLogged === true ? <>
            <div className={styles.menuSection}>
                <span>Dashboard</span>
                <hr/>
            </div>
            
            <div className={styles.loggedLinks}>
                <Link href={"/dashboard"} className={styles.link} onClick={() => handleToggleClick()}>
                        Painel
                    </Link>
                    <Link href={"#"} className={styles.link} onClick={() => handleToggleClick()}>
                        Minha conta
                    </Link>
                    <Link href={"/pagamentos"}className={styles.link} onClick={() => handleToggleClick()}>
                        Pagamentos
                    </Link>
                </div></> : <div></div>}
        </div>}
        </div>
    )
}