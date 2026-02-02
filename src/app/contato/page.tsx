'use client'

import { MdOutlineEmail } from 'react-icons/md'
import styles from './style.module.scss'
import { BsInstagram, BsWhatsapp } from 'react-icons/bs'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PiArrowRightBold } from 'react-icons/pi'

export default function Contato() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''
        setIsMobile(/mobile/i.test(userAgent))
    }, [])

    return (
        <div className={styles.pageWrapper}>
            <section className={styles.heroSection}>
                <div className={styles.titleContainer}>
                    <h1>Como podemos ajudar?</h1>
                    <p>Nossa equipe está pronta para tirar suas dúvidas e ajudar você a conquistar sua bolsa de estudos.</p>
                </div>
            </section>

            <div className={styles.contentContainer}>
                <div className={styles.contactGrid}>
                    {/* E-mail Card */}
                    <div className={styles.contactCard}>
                        <div className={styles.iconWrapper}>
                            <MdOutlineEmail />
                        </div>
                        <h3 className={styles.cardTitle}>E-mail</h3>
                        <p className={styles.cardDescription}>Para dúvidas gerais, parcerias ou questões administrativas.</p>
                        <strong className={styles.contactTarget}>motivabolsas@gmail.com</strong>
                        <Link
                            href="mailto:motivabolsas@gmail.com"
                            className={styles.actionButton}
                        >
                            Enviar E-mail
                        </Link>
                    </div>

                    {/* WhatsApp Card */}
                    <div className={styles.contactCard}>
                        <div className={styles.iconWrapper}>
                            <BsWhatsapp />
                        </div>
                        <h3 className={styles.cardTitle}>WhatsApp</h3>
                        <p className={styles.cardDescription}>Atendimento rápido para dúvidas sobre matrícula e pagamentos.</p>
                        <strong className={styles.contactTarget}>75 98280-2259</strong>
                        <Link
                            href="https://api.whatsapp.com/send/?phone=5575982802259&text=Olá%2C+gostaria+de+tirar+algumas+dúvidas."
                            target="_blank"
                            className={styles.actionButton}
                        >
                            Iniciar Conversa
                        </Link>
                    </div>

                    {/* Instagram Card */}
                    <div className={styles.contactCard}>
                        <div className={styles.iconWrapper}>
                            <BsInstagram />
                        </div>
                        <h3 className={styles.cardTitle}>Instagram</h3>
                        <p className={styles.cardDescription}>Siga-nos e tire suas dúvidas via Direct em nossas redes sociais.</p>
                        <strong className={styles.contactTarget}>@motivabolsas</strong>
                        <Link
                            href={isMobile ? "instagram://user?username=motivabolsas" : "https://instagram.com/motivabolsas"}
                            target="_blank"
                            className={styles.actionButton}
                        >
                            Ver Perfil
                        </Link>
                    </div>
                </div>

                <div className={styles.footerNote}>
                    <p>Precisa de algo mais específico? Visite nossa página de <Link href="/faq">Perguntas Frequentes</Link>.</p>
                </div>
            </div>
        </div>
    )
}
