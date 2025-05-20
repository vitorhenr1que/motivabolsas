import { MdOutlineEmail } from 'react-icons/md'
import styles from './style.module.scss'
import { BsInstagram, BsWhatsapp } from 'react-icons/bs'
import Link from 'next/link'
import {headers} from 'next/headers'

export default function Contato(){
    const userAgent = headers().get('user-agent') || ''
    const isMobile = /mobile/i.test(userAgent)

    return(
        <div className={styles.container}>
          

            <div className={styles.titleContainer}>
                <h1>Como você prefere falar com a gente?</h1>
            </div>
            <div className={styles.contentContainer}>
            <div className={styles.contactContainer}>
                <div className={styles.contactDiv}>
                    <MdOutlineEmail className={styles.icon} size={32}/>
                    <span className={styles.contactTitle}>E-mail</span>
                    <span className={styles.contactText}>Tem alguma Dúdiva?</span>
                    <strong className={styles.contactStrong}>motivabolsas@gmail.com</strong>
                </div>
                <div className={styles.contactDiv}>
                    <BsWhatsapp className={styles.icon} size={32}/>
                     <span className={styles.contactTitle}>Whatsapp</span>
                     <span className={styles.contactText}>Precisa de alguma ajuda agora?</span>
                     <Link href={"https://api.whatsapp.com/send/?phone=5575982802259&text=Ol%C3%A1%2C+gostaria+de+tirar+algumas+d%C3%BAvidas.&type=phone_number&app_absent=0"} target={"_blank"} className={styles.contactStrong}>75 98280-2259</Link>
                </div>
                <div className={styles.contactDiv}>
                    <BsInstagram className={styles.icon} size={32}/>
                    <span className={styles.contactTitle}>Instagram</span>
                    <span className={styles.contactText}>Fale conosco no Direct</span>
                    <Link href={isMobile ? "instagram://user?username=motivabolsas" : "https://instagram.com/motivabolsas"} target='_blank' className={styles.contactStrong}>@motivabolsas</Link>
                </div>
            </div>
            </div>
        </div>
    )
}
