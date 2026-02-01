'use client'
import React, { FormEvent, useEffect, useState } from 'react'
import styles from './style.module.scss'
import { api } from '../services/api'
import { CPFInput } from '../components/CpfInput'
import { PasswordInput } from '../components/PasswordInput'
import Link from 'next/link'
import Image from 'next/image'
import logo from '../public/logo.png'
import { navigate } from '../actions'
import { Loading } from '../components/Loading'
import PhoneInput from '../components/PhoneInput'
import AddressLookup from '../components/AdressInputs/AdressLookup'
import { CreateInput } from '../components/CreateInput'
import { SelectInstituition } from '../components/SelectInstituition'
import { PiUserBold, PiEnvelopeSimpleBold, PiMapPinBold, PiCheckCircleBold, PiArrowLeftBold, PiPhoneBold, PiHouseBold, PiHashBold, PiPlusBold, PiShieldCheckBold, PiUsersBold, PiGraduationCapBold } from 'react-icons/pi'

export default function Create() {
    const [loading, setLoading] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [acceptedTerms, setAcceptedTerms] = useState(false)

    function generateShortId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    const validations: Record<string, (val: string) => string | null> = {
        name: (val) => val.trim().split(' ').length >= 2 ? null : 'Digite seu nome completo (nome e sobrenome).',
        email: (val) => String(val).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) ? null : 'E-mail inválido. Ex: seu@email.com',
        cpf: (val) => val.length === 14 ? null : 'CPF incompleto ou inválido.',
        phone: (val) => {
            const numbers = val.replace(/\D/g, "");
            return numbers.length === 11 ? null : 'Telefone inválido. Digite o DDD + 9 números.';
        },
        password: (val) => /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/.test(val) ? null : 'A senha deve ter 8+ caracteres, uma maiúscula, um número e um símbolo.',
    }

    const handleBlur = (field: string, value: string) => {
        if (validations[field]) {
            const error = validations[field](value);
            setFieldErrors(prev => ({ ...prev, [field]: error || '' }));
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setLoading(true)
        setFieldErrors({})

        const formData = new FormData(e.target as HTMLFormElement)
        const data = Object.fromEntries(formData)

        // Validação Final
        const errors: Record<string, string> = {}
        Object.keys(validations).forEach(field => {
            const error = validations[field](String(data[field] || ''));
            if (error) errors[field] = error;
        })

        if (data.password !== data.passConfirm) {
            errors.passConfirm = 'As senhas não coincidem.'
        }

        if (!acceptedTerms) {
            errors.terms = 'Você precisa aceitar os termos de uso para continuar.'
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            setLoading(false)
            return
        }

        try {
            const createUser = await api.post('/create', {
                ...data,
                customerId: generateShortId()
            })

            const userId = createUser.data.createUser.id;
            const createCustomer = await api.post('stripe/create-customer', {
                email: data.email,
                name: data.name,
                cpf: data.cpf,
            })

            const customerId = createCustomer.data.customer.id;
            await api.put('update-customer-id', {
                id: userId,
                customerId: customerId
            })

            alert('Parabéns! Sua conta foi criada com sucesso.')
            setLoading(false)
            return navigate('/login')

        } catch (e: any) {
            const serverMsg = e.response?.data?.err?.meta?.target;
            if (serverMsg === 'User_email_key') {
                setFieldErrors({ email: 'Este e-mail já está cadastrado.' })
            } else if (serverMsg === 'User_cpf_key') {
                setFieldErrors({ cpf: 'Este CPF já está cadastrado.' })
            } else {
                setFieldErrors({ form: 'Ocorreu um erro ao criar sua conta. Tente novamente mais tarde.' });
            }
            setLoading(false);
        }
    }

    return (
        <div className={styles.container}>
            {/* Sidebar Visual */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarOverlay} />
                <div className={styles.sidebarContent}>
                    <Link href="/" className={styles.logoLink}>
                        <Image src={logo} alt="Motiva Bolsas" height={60} priority />
                    </Link>

                    <h2>Seu futuro começa com <span>um clique</span>.</h2>
                    <p className={styles.sidebarDesc}>Leva menos de 2 minutos para garantir sua bolsa de até 70% e transformar sua carreira.</p>

                    <div className={styles.benefitsList}>
                        <div className={styles.benefitItem}>
                            <div className={styles.benefitIcon}><PiGraduationCapBold /></div>
                            <div className={styles.benefitInfo}>
                                <strong>Bolsas Oficiais</strong>
                                <span>Parcerias diretas com as melhores instituições.</span>
                            </div>
                        </div>
                        <div className={styles.benefitItem}>
                            <div className={styles.benefitIcon}><PiUsersBold /></div>
                            <div className={styles.benefitInfo}>
                                <strong>1.500+ Alunos</strong>
                                <span>Faça parte da maior comunidade de bolsistas.</span>
                            </div>
                        </div>
                        <div className={styles.benefitItem}>
                            <div className={styles.benefitIcon}><PiShieldCheckBold /></div>
                            <div className={styles.benefitInfo}>
                                <strong>Segurança Total</strong>
                                <span>Seus dados protegidos e inscrição garantida.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Form Area */}
            <main className={styles.formArea}>
                <div className={styles.formWrapper}>
                    <header className={styles.formHeader}>
                        <Link href="/login" className={styles.backLink}>
                            <PiArrowLeftBold /> Já tenho uma conta
                        </Link>
                        <h1>Crie sua conta</h1>
                        <p>Preencha os dados abaixo para garantir seu desconto exclusivo.</p>
                    </header>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        {/* Seção 1: Dados Pessoais */}
                        <section className={styles.section}>
                            <div className={styles.sectionTitle}>
                                <PiUserBold />
                                <h3>Dados Pessoais</h3>
                            </div>

                            <CreateInput
                                id='name' name='name' type='text' label='Nome Completo'
                                placeholder='Como está no seu RG' required maxLength={100}
                                error={fieldErrors.name}
                                icon={<PiUserBold />}
                                onBlur={(e) => handleBlur('name', e.target.value)}
                            />

                            <CreateInput
                                id='email' name='email' type='email' placeholder='ex: joao@email.com'
                                label='E-mail' required maxLength={50}
                                error={fieldErrors.email}
                                icon={<PiEnvelopeSimpleBold />}
                                onBlur={(e) => handleBlur('email', e.target.value)}
                            />

                            <div className={styles.gridRow}>
                                <CPFInput />
                                <PhoneInput error={fieldErrors.phone} />
                            </div>

                            <div className={styles.gridRow}>
                                <PasswordInput id={"password"} label={"Senha"} placeholder={"Crie uma senha forte"} />
                                <PasswordInput id={"passConfirm"} label={"Confirmar Senha"} placeholder={"Repita a senha"} />
                            </div>
                        </section>

                        {/* Seção 2: Acadêmico */}
                        <section className={styles.section}>
                            <div className={styles.sectionTitle}>
                                <PiCheckCircleBold />
                                <h3>Interesse Acadêmico</h3>
                            </div>
                            <SelectInstituition />
                        </section>

                        {/* Seção 3: Endereço */}
                        <section className={styles.section}>
                            <div className={styles.sectionTitle}>
                                <PiMapPinBold />
                                <h3>Endereço para Matrícula</h3>
                            </div>
                            <AddressLookup />
                            <div className={styles.gridRow}>
                                <CreateInput
                                    id='neighborhood' name='neighborhood' type='text'
                                    placeholder='Seu bairro' label='Bairro' required maxLength={60}
                                    error={fieldErrors.neighborhood}
                                    icon={<PiHouseBold />}
                                />
                                <CreateInput
                                    id='street' name='street' type='text'
                                    placeholder='Rua ou Avenida' label='Logradouro' required maxLength={100}
                                    error={fieldErrors.street}
                                    icon={<PiMapPinBold />}
                                />
                            </div>
                            <div className={styles.gridRow}>
                                <CreateInput
                                    id='number' name='number' type='text'
                                    placeholder='Nº' label='Número' required maxLength={10}
                                    error={fieldErrors.number}
                                    icon={<PiHashBold />}
                                />
                                <CreateInput
                                    id='complement' name='complement' type='text'
                                    placeholder='Apt, Bloco (opcional)' label='Complemento' required={false} maxLength={30}
                                    icon={<PiPlusBold />}
                                />
                            </div>
                        </section>

                        <div className={styles.termsWrapper}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                />
                                <span>
                                    Eu li e concordo com os <Link href="/termos">Termos de Uso</Link> e a <Link href="/privacidade">Política de Privacidade</Link>.
                                </span>
                            </label>
                            {fieldErrors.terms && <span className={styles.errorMessage}>{fieldErrors.terms}</span>}
                        </div>

                        {fieldErrors.form && <div className={styles.errorMessage}>{fieldErrors.form}</div>}

                        <footer className={styles.formFooter}>
                            <button type='submit' className={styles.submitButton} disabled={loading}>
                                {loading ? <Loading /> : "Garantir minha Bolsa Grátis"}
                            </button>
                            <p className={styles.loginHint}>
                                Já tem uma conta? <Link href="/login">Fazer login</Link>
                            </p>
                        </footer>
                    </form>
                </div>
            </main>
        </div>
    )
}
