'use client'
import Link from "next/link";
import styles from './style.module.scss'
import { useEffect } from "react";

interface SolicitarBolsaProps{
    faculdade: string;
    fixed: boolean;
}

declare global { // para quando uma função não existir dentro do window
    interface Window { 
      fbq?: (...args: any[]) => void; //o window pode ter uma função fbq que aceita qualquer conjunto de argumentos
    }
  }

export function SolicitarBolsa({faculdade, fixed}: SolicitarBolsaProps){
    useEffect(() => {
        const solicitarBolsaButton = document.getElementById(`solicitar_bolsa_${faculdade}`)
        const solicitarBolsaButtonMobile = document.getElementById(`solicitar_bolsa_mobile_${faculdade}`)
        if(solicitarBolsaButton){
            const handleClick = () => {
                if (typeof window !== "undefined" && window.fbq) {
                    window.fbq("trackCustom", `solicitar_bolsa_${faculdade}`); // nome do evento da meta, nome da conversão personalizada
                    console.log(`Evento solicitar_bolsa_${faculdade} enviado ao Meta Pixel`);
                  }
            }
            const handleClickMobile = () => {
                if (typeof window !== "undefined" && window.fbq) {
                    window.fbq("trackCustom", `solicitar_bolsa_mobile_${faculdade}`); // nome do evento da meta, nome da conversão personalizada
                    console.log(`Evento solicitar_bolsa_mobile_${faculdade} enviado ao Meta Pixel`);
                  }
            }
            solicitarBolsaButton.addEventListener('click', handleClick)
            solicitarBolsaButtonMobile?.addEventListener('click', handleClickMobile)
            return () => {
                solicitarBolsaButton.removeEventListener('click', handleClick)
                solicitarBolsaButtonMobile?.removeEventListener('click', handleClickMobile)
            }
        }
    },[])
    return !fixed ? (
        <Link className={styles.linkButton} id={`solicitar_bolsa_${faculdade}`} href="https://api.whatsapp.com/send/?phone=5575982802259&text=Ol%C3%A1%2C+gostaria+de+solicitar+minha+bolsa.&type=phone_number&app_absent=0">Solicitar Bolsa</Link>
    ) : (<Link id={`solicitar_bolsa_mobile_${faculdade}`} href={"https://api.whatsapp.com/send/?phone=5575982802259&text=Ol%C3%A1%2C+gostaria+de+solicitar+minha+bolsa.&type=phone_number&app_absent=0"}  className={styles.fixedLinkButton}>
        <span>Solicitar Bolsa</span>
    </Link>)
    
}