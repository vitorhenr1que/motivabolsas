import Link from "next/link";
import styles from './style.module.scss'

interface infoPayContainerProps{
    firstPayment: boolean
}

export function InfoPayContainer({firstPayment}: infoPayContainerProps){
    console.log('Já pagou? ', firstPayment)
   if(firstPayment === true){
    return (
        <div className={styles.infoPayContainer}>
        <span>A sua bolsa não foi renovada para esse semestre. Efetue o pagamento para renova-la.</span>
        {/* <PaymentButton user={user}/> */}
        <Link href={"https://api.whatsapp.com/send/?phone=5575982802259&text=Ol%C3%A1%2C+gostaria+de+renovar+minha+bolsa.&type=phone_number&app_absent=0"} className={styles.linkRenovacao} target="_blank">Solicite a renovação</Link>
        </div> 
    )
   } 
   else {
    return (
        <div className={styles.infoPayContainer}>
        <span>A sua bolsa ainda não foi ativada. Clique no botão para solicitar a bolsa.</span>
        {/* <PaymentButton user={user}/> */}
        <Link href={"https://api.whatsapp.com/send/?phone=5575982802259&text=Ol%C3%A1%2C+gostaria+de+solicitar+minha+bolsa.&type=phone_number&app_absent=0"} className={styles.linkRenovacao} target="_blank">Solicite a bolsa</Link>
        </div> 
    )
   }
}