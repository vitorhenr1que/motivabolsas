'use client'

import React, { FormEvent, useEffect, useState } from 'react'
import styles from './style.module.scss'
import { api } from '../services/api'
import { CPFInput } from '../components/CpfInput'
import { PasswordInput } from '../components/PasswordInput'
import { redirect } from 'next/navigation'
import { navigate } from '../actions'
import { Loading } from '../components/Loading'
import PhoneInput from '../components/PhoneInput'
import AddressLookup from '../components/AdressInputs/AdressLookup'
import { CreateInput } from '../components/CreateInput'
import { getClient } from '../services/prismic'
import { FarvalleDocument, FarvalleDocumentData, FazagDocument, FazagDocumentData, Simplify, UniversityDocument } from '../../../prismicio-types'
import { SelectInstituition } from '../components/SelectInstituition'


interface DataProps{
    name: string,
    email: string,
    cpf: number,
    password: string,
    passConfirm: string
}



export default function Create(){

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [generatedId, setGeneratedId] = useState(generateShortId())

    function generateShortId() { // Gera Id curto para o customerId do prisma -> ex: V1StGXR8_Z
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      }

    const validateName = (name: FormDataEntryValue) => { // Função de Validar nome
        if(!!name === false || String(name).length < 16){
            return false
        }
        else true
    }

    const validatePassword = (password: FormDataEntryValue) => { // Função de Validar senha
        const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
        return regex.test(String(password));
    }

    const validateEmail = (email: FormDataEntryValue) => { // Função de Validar e-mail
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
      };

    const validateCPF = (cpf: FormDataEntryValue) => { // Função de Validar CPF
        return String(cpf).length === 14
    }

    function validateCep(cep: FormDataEntryValue){
        return String(cep).length === 8
    }

    async function handleSubmit(e: FormEvent){
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.target as HTMLFormElement)
        const data = Object.fromEntries(formData)
        console.log(data)
        if(data.password !== data.passConfirm){
            setError('As senhas não coincidem. Verifique e tente novamente.')
            setLoading(false)
            return 
        }
        try {

            if(validateName(data.name) === false){ //Verificação de Nome
                setError('Insira seu nome completo.')
                setLoading(false)
                return
            }

            if(!!validateEmail(data.email) === false){ // Verificação de e-mail
                setError('Endereço de e-mail inválido. Por favor, insira um e-mail no formato correto (exemplo: nome@dominio.com).')
                setLoading(false)
                return 
            }

            if(validatePassword(data.password) === false){
                setError('A senha deve conter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, um número e um caractere especial.')
                setLoading(false)
                return
            }

            if(validateCPF(data.cpf) === false){
                setError('CPF Inválido. Por favor, insira um CPF válido.')
                setLoading(false)
                return
            }
            if(validateCep(data.cep) === false){
                setError('CEP Inválido. Por favor, insira os 8 números.')
                setLoading(false)
                return
            }


            const createUser = await api.post('/create', { //Criar usuário no banco de dados
                email: data.email,
                password: data.password,
                cpf: data.cpf,
                name: data.name,
                phone: data.phone ,
                instituition: data.instituition,
                course: data.course,
                cep: data.cep ,
                city: data.city ,
                neighborhood: data.neighborhood ,
                number: data.number ,
                street: data.street ,
                uf: data.uf ,
                complement: data.complement ,
                customerId: generateShortId() // id aleatório
            })

            const userId = await createUser.data.createUser.id //Pegar ID do usuário criado

            const createCustomer = await api.post('stripe/create-customer', { //Criar cliente no Stripe
                email: data.email,
                name: data.name,
                cpf: data.cpf,
            })

            const customerId = await createCustomer.data.customer.id //Pegar ID do Cliente no Stripe

            const updateUserCustomer = await api.put('update-customer-id', { // Passar ID do banco e ID do stripe
                id: userId,
                customerId: customerId
            })

             alert('Usuário Criado com sucesso')
             setLoading(false)
             return navigate('/login')
             
        } catch(e: any){

            if(e.response?.data.err.meta?.target === 'User_email_key'){
                setError('O e-mail informado já está cadastrado em nosso sistema.')
                setLoading(false)
            }
            else if(e.response?.data.err.meta?.target === 'User_cpf_key'){
                setError('O CPF informado já está cadastrado em nosso sistema.')
                setLoading(false)
            }
            else{
                console.log(e)
                setLoading(false)
                return alert('Ocorreu algum erro durante o cadastro.')
            }   
            }
        }

  

        return(
        <div className={styles.generalContainer}>
        <div className={styles.container}>
        <h1>Crie sua conta</h1>
        <form className={styles.formContainer} onSubmit={(e) => handleSubmit(e)}>
            <CreateInput id='name' name='name' type='text' label='Nome Completo *' placeholder='Nome completo' required={true} maxLength={100}/>
            <CreateInput id='email' name='email' type='email' placeholder='E-mail' label='E-mail *' required={true} maxLength={50}/>
            {/* <div className={styles.inputContainer}>
                <label htmlFor="password">Senha *</label>
                <input name='password' type='password' id='password' placeholder='Senha'/>
            </div> */}
            <PasswordInput id={"password"} label={"Senha:"} placeholder={"Digite sua senha"}/>
            <PasswordInput id={"passConfirm"} label={"Confirmar Senha:"} placeholder={"Digite sua senha"}/>
            {/* <div className={styles.inputContainer}>
                <label htmlFor="passConfirm">Confirmar Senha *</label>
                <input name='passConfirm' id='passConfirm' type='password' placeholder='Confirme sua senha'/>
            </div> */}
            {/* <div className={styles.inputContainer}>
                <label htmlFor="cpf">CPF *</label>
                <input name='cpf' id='cpf' type='number' placeholder='CPF'/>
            </div> */}
            <div className={styles.doubleInputContainer}>
                <CPFInput/>
                <PhoneInput/>
            </div>
            <div className={styles.doubleInputContainer}>
                <SelectInstituition/>
            </div>
            <div>
                <strong>Endereço</strong>
            </div>
            <hr className={styles.hr}/>
            <AddressLookup/>
            <div className={styles.doubleInputContainer}>
                <CreateInput id='neighborhood' name='neighborhood' type='text' placeholder='Bairro' label='Bairro *' required={true} maxLength={60}/>
                <CreateInput id='street' name='street' type='text' placeholder='Rua' label='Rua *' required={true} maxLength={100}/>
            </div>
            <div className={styles.doubleInputContainer}>
                <CreateInput id='number' name='number' type='text' placeholder='Número' label='Número *' required={true} maxLength={10}/>
                <CreateInput id='complement' name='complement' type='text' placeholder='Complemento' label='Complemento' required={false} maxLength={30}/>
            </div>
            {error && <span className={styles.error}>{error}</span>}
            <button type='submit' className={styles.signUpButton}>{!!loading ? <Loading/> : "Cadastrar"}</button>
        </form>
        </div>
        </div>
    )
}