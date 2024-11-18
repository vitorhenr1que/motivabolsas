'use client'
import Image from 'next/image'
import styles from './style.module.scss'
import Link from 'next/link'
import logo from '../public/logo.png'
import { GoMortarBoard } from "react-icons/go";
import { IoIosArrowForward } from "react-icons/io";
import { useEffect, useState } from 'react'
import { authenticate } from '../lib/actions'
import { useFormState, useFormStatus } from 'react-dom'
import loginAction  from './loginAction'
import { Loading } from '../components/Loading'
 



export default function LogIn(){
    const [errorMessage, formAction] = useFormState(loginAction, undefined)
    const [loading, setLoading] = useState(false)
    function LoginButton() {
        
        const { pending } = useFormStatus()
        console.log(loading)
        const handleClick = (event: Event) => {
          if (pending) {
            event.preventDefault()
          }
  
        }
       useEffect(() => {
        setLoading(pending)
       }, [pending])
        return (
          <button aria-disabled={pending} disabled={pending} type="submit" onClick={() => handleClick} className={styles.loginButton}>
          <div className={styles.loginButtonDiv}>
              
              <span>{!!loading ? <Loading/> : "Entrar"}</span>
          </div>
        </button>
        )
      }



    return (
    <div className={styles.container}>
        <div className={styles.imageContainer}>

        </div>
        <div className={styles.formContainer}>
            <Image src={logo} width={150} alt='img'/>
            <h1>Acesse sua conta</h1>
            <form className={styles.form} action={formAction}>
                <div className={styles.inputEmail}>
                    <label htmlFor="email">E-mail</label>
                    <input placeholder='Seu e-mail' type='email' name='email' id='email' required/>
                </div>
                <div className={styles.inputSenha}>
                <label htmlFor="password">Senha</label>
                <input placeholder='Sua senha' type='password' name='password' id='password' required/>
                </div>
                <div className={styles.divLink}>
                    <Link href={"#"} >Esqueci minha senha</Link>
                </div>
                <div className={styles.divSignIn}>
                {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
                <LoginButton/>
                </div>
                
            </form>
            <hr/>
            <Link href={"/create"} className={styles.createAccountContainer}>
                <div className={styles.createAccountIcon}><GoMortarBoard size={30} color='#2093d1'/></div>
                <div className={styles.createAccountSpans}>
                    Não tem uma conta?
                    <span>Inscreva-se gratuitamente.</span>
                </div>
                <div className={styles.createAccountArrow}><IoIosArrowForward size={16} color='#a0a0a0'/></div>
            </Link>
        </div>
    </div>
        
    )
}