'use client'

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { api } from "@/app/services/api"
import styles from './style.module.scss'

interface userDataProps{
    user: undefined | {
        birthDate: Date | null,
        cpf: string,
        createdAt: Date,
        email: string,
        id: string,
        name: string,
        currentPayment: boolean,
        customerId: string
    }
}

export default function PaymentButton({user}: userDataProps){
    

    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false)
    function handleButton(){
        console.log(user?.id)
    }
    async function handleClickBuyButton(userId?: string, userEmail?: string, customerId?: string){
        console.log('Entrou')
        try{
            setIsCreatingCheckout(true)
            if(!userId){
                throw new Error("Não foi informado o ID como parâmetro para o checkout")
            }
            if(!userEmail){
                throw new Error("Não foi informado o E-mail como parâmetro para o checkout")
            }
            if(!customerId){
                throw new Error("Não foi informado o customerId como parâmetro para o checkout")
            }
            const checkoutResponse = await api.post('stripe/create-checkout', {
                userId: userId, 
                email: userEmail,
                customerId: customerId
            })
            console.log('checkoutResponse: ', await checkoutResponse.data)
            

            const stripeClient = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string)
            if(!stripeClient){
                throw new Error("Striple failed to initialize, verify .env variables")
            }

            const { sessionId } = await checkoutResponse.data

            await stripeClient.redirectToCheckout({sessionId})
            
        }catch(e){
            console.error(e)
    } finally{
        setIsCreatingCheckout(false)
    }
        
    }

    return (
        <>
        <button className={styles.paymentButton} onClick={() => handleClickBuyButton(user?.id, user?.email, user?.customerId)} disabled={isCreatingCheckout}>Renovar Bolsa</button>
        </>
    )
}