'use client'
import { useSearchParams } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { prisma } from '../services/prisma'
import styles from './style.module.scss'
import { PasswordInput } from '../components/PasswordInput'
import { api } from '../services/api'
import { Loading } from '../components/Loading'
import { useRouter } from 'next/navigation'

export default function RedefinirSenha(){
    const searchParams = useSearchParams()
    const [tokenMail, setTokenMail] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const email = searchParams.get('email')
    const token = searchParams.get('token')
    const router = useRouter()
    useEffect(() => {
        
    },[])

    const validateEmail = (email: string | null) => { // Função de Validar e-mail
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
      };

      const validatePassword = (password: FormDataEntryValue) => { // Função de Validar senha
        const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
        return regex.test(String(password));
    }

    async function handleSubmit(e: FormEvent){
      e.preventDefault()
      setLoading(true)
      const formData = new FormData(e.target as HTMLFormElement)
      const data = Object.fromEntries(formData)

      if(data.password !== data.passConfirm){
        setError('As senhas não coincidem. Verifique e tente novamente.')
        console.log('senha não são iguais')
        setLoading(false)
        return 
    }
     if(!!validateEmail(email) === false){ // Verificação de e-mail
        setError('Endereço de e-mail inválido. Por favor, insira um e-mail no formato correto (exemplo: nome@dominio.com).')
        
        setLoading(false)
        return 
        }

        if(validatePassword(data.password) === false){
            setError('A senha deve conter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, um número e um caractere especial.')
            setLoading(false)
            return
        }

      try {
        await api.post('/reset-password', {
          email: email,
          token: token,
          password: data.password
        })
        setLoading(false)
        alert('Sua senha foi alterada com sucesso!.')
        router.push(`/login`)
      } catch(err: any){
        console.log(err, 'Erro com a validação do formulário')
        setError(err.response.data.message)
        setLoading(false)
      }
    }

    return email && token ? (
        <div className={styles.container}>
        <h1>Redefinir senha</h1>
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <PasswordInput id={"password"} label={"Digite sua nova senha:"} placeholder={"Digite sua nova senha"}/>
            <PasswordInput id={"passConfirm"} label={"Confirme sua nova senha:"} placeholder={"Confirme sua nova senha"}/>
            <span className={styles.error}>{error}</span>
            <button className={styles.submitButton} type='submit'>{loading ? <Loading/> : "Redefinir senha"}</button>
        </form>
        
        </div>
    ) : (
        <h1>E-mail ou Token não está presente</h1>
    )
}