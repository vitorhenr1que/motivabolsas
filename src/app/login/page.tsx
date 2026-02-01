'use client'
import Image from 'next/image'
import styles from './style.module.scss'
import Link from 'next/link'
import logo from '../public/logo.png'
import { GoMortarBoard } from "react-icons/go";
import { IoIosArrowForward } from "react-icons/io";
import { useEffect, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import loginAction from './loginAction'
import { Loading } from '../components/Loading'
import { ModalResetRequest } from '../components/ModalResetRequest'
import { PiEnvelopeSimpleBold, PiLockKeyBold } from 'react-icons/pi'

export default function LogIn() {
    const [errorMessage, formAction] = useFormState(loginAction, undefined)
    const [loading, setLoading] = useState(false)

    function LoginButton() {
        const { pending } = useFormStatus()

        useEffect(() => {
            setLoading(pending)
        }, [pending])

        return (
            <button
                aria-disabled={pending}
                disabled={pending}
                type="submit"
                className={styles.loginButton}
            >
                <div className={styles.loginButtonDiv}>
                    {loading ? <Loading /> : "Entrar na conta"}
                </div>
            </button>
        )
    }

    return (
        <div className={styles.container}>
            {/* Lado Esquerdo - Visual e Marketing */}
            <div className={styles.heroSide}>
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <div className={styles.heroBadge}>Portal do Aluno</div>
                    <h2>Transforme seu futuro com o <span>Motiva Bolsas</span>.</h2>
                    <p>Acesse seu painel, acompanhe suas solicitações e gerencie seus pagamentos em um só lugar.</p>
                </div>
            </div>

            {/* Lado Direito - Formulário */}
            <div className={styles.formSide}>
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <Link href="/" className={styles.logoLink}>
                            <Image src={logo} alt='Motiva Bolsas' height={50} priority />
                        </Link>
                        <h1>Bem-vindo de volta!</h1>
                        <p className={styles.subtitle}>Insira seus dados para acessar o portal.</p>
                    </div>

                    <form className={styles.form} action={formAction}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">E-mail</label>
                            <div className={styles.inputWrapper}>
                                <PiEnvelopeSimpleBold className={styles.inputIcon} />
                                <input
                                    placeholder='exemplo@email.com'
                                    type='email'
                                    name='email'
                                    id='email'
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <div className={styles.labelRow}>
                                <label htmlFor="password">Senha</label>
                                <ModalResetRequest />
                            </div>
                            <div className={styles.inputWrapper}>
                                <PiLockKeyBold className={styles.inputIcon} />
                                <input
                                    placeholder='Sua senha secreta'
                                    type='password'
                                    name='password'
                                    id='password'
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.actionRow}>
                            {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
                            <LoginButton />
                        </div>
                    </form>

                    <div className={styles.divider}>
                        <span>ou</span>
                    </div>

                    <Link href="/create" className={styles.registerCard}>
                        <div className={styles.cardIcon}>
                            <GoMortarBoard size={24} />
                        </div>
                        <div className={styles.cardInfo}>
                            <strong>Ainda não tem conta?</strong>
                            <span>Inscreva-se e garanta sua bolsa agora.</span>
                        </div>
                        <IoIosArrowForward className={styles.cardArrow} />
                    </Link>

                    <p className={styles.footerCopy}>
                        © 2026 Motiva Bolsas. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    )
}