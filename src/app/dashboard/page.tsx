'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PaymentButton from "../components/dashboard/paymentButton";
import GenerateContractButton from "../components/GenerateContractButton";
import { api } from "../services/api";
import styles from './style.module.scss'
import Link from "next/link";
import { SignOut } from "../services/logout";
import { DivDashboard } from "../components/dashboard/DivDashboard";
import { Loading } from "../components/Loading";
import { getInterToken } from "../services/inter-token";
import { PiSignOutBold, PiCheckCircleFill, PiWarningCircleFill, PiScrollBold, PiGraduationCapBold, PiBuildingsBold, PiCreditCardBold, PiShieldCheckBold } from 'react-icons/pi'
import { BoletoViewer } from "../components/BoletoViewer";
import { useUser } from "../components/contexts/user-provider";

interface userDataProps {
    birthDate: Date | null,
    cpf: string,
    createdAt: Date,
    email: string,
    id: string,
    name: string,
    instituition: string,
    course: string,
    discount: string | null,
    currentPayment: boolean,
    firstPayment: boolean,
    customerId: string,
    phone: string,
    addresses: Array<{
        street: string,
        number: string,
        complement: string | null,
        neighborhood: string,
        uf: string,
        city: string,
        cep: string
    }>
}

interface Pagador {
    nome: string;
    cpfCnpj: string;
}

interface Cobranca {
    codigoSolicitacao: string;
    dataEmissao: string;
    dataSituacao: string;
    dataVencimento: string;
    origemRecebimento: string;
    pagador: Pagador;
    seuNumero: string;
    situacao: string;
    tipoCobranca: string;
    valorNominal: string;
    valorTotalRecebido: string;
}

interface ApiResponse {
    cobranca: Cobranca;
}

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<userDataProps>()
    const [loading, setLoading] = useState(true)
    const [loadingButton, setLoadingButton] = useState(false)
    const [disablePaymentButton, setDisablePaymentButton] = useState(false)
    const [checkingBoletos, setCheckingBoletos] = useState(false)
    const [paymentMessage, setPaymentMessage] = useState("")
    const { setUser: setGlobalUser } = useUser()

    function handleLogOut() {
        setGlobalUser(undefined)
        SignOut()
    }

    // New states for Pending Boletos Panel
    const [boletosList, setBoletosList] = useState<ApiResponse[]>([])
    const [viewBoleto, setViewBoleto] = useState('')
    const [pdf, setPdf] = useState('')
    const [loadingViewBoleto, setLoadingViewBoleto] = useState('')

    useEffect(() => {
        setLoading(true)
        const getUser = async () => {
            try {
                const response = await api.post('/userinfo')
                const userData = response.data
                setUser(userData)

                if (userData && !userData.currentPayment) {
                    await checkUserBoletos(userData.cpf)
                }

            } catch (e: any) {
                console.log('Falha ao obter dados:', e.message)
            } finally {
                setLoading(false)
            }
        }
        getUser()
    }, [])

    function convertDate(date: string) {
        return new Date(date + "T00:00:00Z").toLocaleDateString("pt-BR", { timeZone: "UTC" })
    }

    async function handleBoletoView(codigoSolicitacao: string) {
        setLoadingViewBoleto(codigoSolicitacao)
        setViewBoleto(codigoSolicitacao)
        try {
            const { access_token } = await getInterToken()
            const response = await api.post('boletos/view', {
                codigoSolicitacao: codigoSolicitacao,
                interToken: access_token
            })
            setPdf(response.data.pdf)
            setLoadingViewBoleto('')
            return response.data
        } catch (e) {
            setLoadingViewBoleto('')
            console.log('error: ', e)
            return alert(`Erro: ${e}`)
        }
    }

    const checkUserBoletos = async (cpf: string) => {
        try {
            setCheckingBoletos(true)
            const { access_token } = await getInterToken()

            const now = new Date();
            const initialDateObj = new Date();
            initialDateObj.setMonth(now.getMonth() - 2);
            const initialDate = initialDateObj.toISOString().split('T')[0];

            const finalDateObj = new Date();
            finalDateObj.setDate(now.getDate() + 7);
            const finalDate = finalDateObj.toISOString().split('T')[0];

            const response = await api.post('/boletos/find', {
                interToken: access_token,
                cpf,
                initialDate,
                finalDate
            })

            // Inter V3 returns { cobrancas: [...] }
            const cobrancasData = response.data?.cobrancas || []
            setBoletosList(cobrancasData)

            if (cobrancasData.length > 0) {
                // Determine logic for status badge based on most recent boleto
                const sortedBoletos = [...cobrancasData].sort((a: any, b: any) => {
                    return new Date(b.cobranca.dataVencimento).getTime() - new Date(a.cobranca.dataVencimento).getTime()
                })
                const mostRecent = sortedBoletos[0].cobranca

                const isRecebido = mostRecent.situacao === "RECEBIDO" || mostRecent.situacao === "MARCADO_RECEBIDO"
                const isAReceber = mostRecent.situacao === "A_RECEBER"

                if (isRecebido) {
                    setDisablePaymentButton(true)
                    setPaymentMessage("Seu pagamento foi identificado! Estamos processando a ativação definitiva da sua bolsa.")
                } else if (isAReceber) {
                    setDisablePaymentButton(true)
                    // We don't need pendingBoleto state anymore, we use the list
                } else {
                    setDisablePaymentButton(false)
                    setPaymentMessage("")
                }
            } else {
                setDisablePaymentButton(false)
            }

        } catch (error) {
            console.error('Erro ao buscar boletos:', error)
        } finally {
            setCheckingBoletos(false)
        }
    }

    async function handleDownloadComprovante() {
        if (!user) return
        setLoadingButton(true)
        try {
            const response = await api.post('/download-comprovante', {
                name: user?.name,
                course: user?.course,
                instituition: user?.instituition,
                cpf: user?.cpf,
                discount: user?.discount,
                createdAt: user?.createdAt,
                id: user?.id
            }, {
                responseType: 'blob'
            })
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Comprovante - Motiva Bolsas (${user?.instituition.toUpperCase()})`;
            a.click();
            a.remove(); // Clean up
            URL.revokeObjectURL(url);
        } catch (e: any) {
            try {
                // Quando responseType é "blob", o erro vem como Blob também
                const blob = e?.response?.data;
                if (blob instanceof Blob) {
                    const text = await blob.text();
                    console.log("Erro (texto):", text);

                    // tenta parsear como JSON
                    try {
                        console.log("Erro (json):", JSON.parse(text));
                    } catch {
                        // não era json
                    }
                } else {
                    console.log("Erro:", e);
                }
            } catch {
                console.log("Erro:", e);
            }
        } finally {
            setLoadingButton(false);
        }
    }



    if (loading) return (
        <DivDashboard>
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loading />
            </div>
        </DivDashboard>
    )

    const isPaid = user?.currentPayment === true
    const displayDiscount = (() => {
        if (!user) return '0%';
        if (!user.discount || user.discount === "null" || user.discount === "") {
            const isPsychology = user.course?.toLowerCase().includes("psicologia");
            return isPsychology ? "30%" : "40%";
        }
        return user.discount.includes('%') ? user.discount : `${user.discount}%`;
    })();

    return (
        <DivDashboard>
            <div className={styles.dashboardWrapper}>
                {/* Header Section */}
                <header className={styles.header}>
                    <div className={styles.welcome}>
                        <h1>Olá, <span>{user?.name.split(' ')[0]}</span>!</h1>
                        <p>Bem-vindo ao seu painel do aluno.</p>
                    </div>
                    <button className={styles.signOutBtn} onClick={handleLogOut}>
                        <PiSignOutBold /> Sair
                    </button>
                </header>

                {/* Main Action/Status Section */}
                <section className={styles.heroSection}>
                    <div className={styles.statusCard}>
                        {isPaid ? (
                            <div className={`${styles.statusBadge} ${styles.active}`}>
                                <PiCheckCircleFill className={styles.icon} />
                                <div className={styles.texts}>
                                    <strong>Status: Bolsa Ativa e Confirmada</strong>
                                    <span>Tudo certo! Você já é um aluno Motiva Bolsas.</span>
                                </div>
                            </div>
                        ) : (
                            <div className={`${styles.statusBadge} ${styles.pending}`}>
                                <PiWarningCircleFill className={styles.icon} />
                                <div className={styles.texts}>
                                    <strong>Status: Aguardando Pagamento</strong>
                                    <span>Sua bolsa está reservada, mas ainda não foi ativada.</span>
                                </div>
                            </div>
                        )}

                        <div className={styles.actionContent}>
                            {isPaid ? (
                                <>
                                    <h3>O que eu devo fazer agora?</h3>
                                    <p>Sua bolsa está 100% garantida. Baixe seu comprovante oficial e apresente na {user?.instituition} no momento da sua matrícula para garantir o desconto de {displayDiscount}.</p>
                                    <div className={styles.actionButtons}>
                                        <button className={styles.btnPrimary} onClick={handleDownloadComprovante}>
                                            {loadingButton ? <Loading /> : <><PiScrollBold /> Baixar Comprovante</>}
                                        </button>
                                        <Link href="/pagamentos" className={styles.btnSecondary}>
                                            <PiCreditCardBold /> Histórico de Pagamentos
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {boletosList.length > 0 ? (
                                        <>
                                            <h3>Painel Boletos Pendentes</h3>
                                            <p>Abaixo estão os boletos gerados recentemente. Verifique a situação e realize o pagamento.</p>

                                            <div className={styles.boletoContainer}>
                                                {boletosList.map((item) => (
                                                    <div key={item.cobranca.codigoSolicitacao} className={styles.boletoItem}>
                                                        <div className={styles.boletoHeader}>
                                                            <div className={styles.code}>
                                                                <strong>Código de Solicitação</strong>
                                                                <span>{item.cobranca.codigoSolicitacao}</span>
                                                            </div>
                                                            <div className={styles.valueStatus}>
                                                                <strong>R$ {item.cobranca.valorNominal}</strong>
                                                                <span>{item.cobranca.situacao}</span>
                                                            </div>
                                                        </div>
                                                        <div className={styles.boletoDetails}>
                                                            <div className={styles.dates}>
                                                                <div>
                                                                    <label>Emissão</label>
                                                                    <span>{convertDate(item.cobranca.dataEmissao)}</span>
                                                                </div>
                                                                <div>
                                                                    <label>Vencimento</label>
                                                                    <span>{convertDate(item.cobranca.dataVencimento)}</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                className={styles.viewBtn}
                                                                disabled={loadingViewBoleto === item.cobranca.codigoSolicitacao}
                                                                onClick={() => handleBoletoView(item.cobranca.codigoSolicitacao)}
                                                            >
                                                                {loadingViewBoleto === item.cobranca.codigoSolicitacao ? <Loading /> : "Visualizar Boleto"}
                                                            </button>
                                                        </div>

                                                        {viewBoleto === item.cobranca.codigoSolicitacao && (
                                                            <div style={{ marginTop: '1rem', borderTop: '1px dashed #e2e8f0', paddingTop: '1rem' }}>
                                                                <BoletoViewer base64={pdf} name={user?.name || 'Boleto'} codigo={item.cobranca.codigoSolicitacao} />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3>Ação Pendente: Liberação da Bolsa</h3>
                                            <p>Para oficializar sua bolsa e obter o comprovante de desconto, você precisa assinar o contrato e realizar o pagamento da taxa semestral de adesão.</p>

                                            <div className={styles.actionButtons}>
                                                {!user?.firstPayment && user && (
                                                    <div style={{ flex: '1 1 200px' }}>
                                                        <GenerateContractButton
                                                            userData={{
                                                                name: user.name,
                                                                cpf: user.cpf,
                                                                course: user.course || "",
                                                                discount: displayDiscount
                                                            }}
                                                            semestre_atual="2026.1"
                                                            className={styles.btnPrimary}
                                                            style={{ background: '#0f172a' }}
                                                        />
                                                    </div>
                                                )}

                                                <div style={{ flex: '1 1 200px' }}>
                                                    <PaymentButton
                                                        user={user}
                                                        disabled={disablePaymentButton || !user?.firstPayment}
                                                        loading={checkingBoletos}
                                                    />
                                                </div>

                                                <div style={{ flex: '1 1 200px' }}>
                                                    <Link href="/contato" className={styles.btnSecondary} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        Preciso de ajuda
                                                    </Link>
                                                </div>
                                            </div>

                                            {!user?.firstPayment && (
                                                <div style={{
                                                    marginTop: '1.25rem',
                                                    padding: '1rem',
                                                    backgroundColor: '#fff1f2',
                                                    borderRadius: '12px',
                                                    border: '1px solid #ffe4e6',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    color: '#e11d48',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    <PiWarningCircleFill style={{ fontSize: '1.25rem' }} />
                                                    <span style={{ fontWeight: 600 }}>Atenção:</span>
                                                    <span>É necessário realizar a assinatura do contrato para liberar a ativação da bolsa.</span>
                                                </div>
                                            )}
                                            {paymentMessage && <p className={styles.paymentMessage}>{paymentMessage}</p>}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Info Grid Section */}
                <section className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}><PiGraduationCapBold /></div>
                        <div className={styles.infoTexts}>
                            <label>Curso Selecionado</label>
                            <strong>{user?.course || 'Não definido'}</strong>
                        </div>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}><PiBuildingsBold /></div>
                        <div className={styles.infoTexts}>
                            <label>Instituição</label>
                            <strong>{`${user?.instituition.substring(0, 1).toUpperCase()}${user?.instituition.substring(1)}` || 'Não definido'}</strong>
                        </div>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}><PiShieldCheckBold /></div>
                        <div className={styles.infoTexts}>
                            <label>Desconto Garantido</label>
                            <strong>{displayDiscount} de Desconto</strong>
                        </div>
                    </div>
                </section>

                {/* Secondary Footer Actions */}
                <footer className={styles.footer}>
                    <Link href="/termos" className={styles.footerLink}>Termos</Link>
                    <Link href="/privacidade" className={styles.footerLink}>Privacidade</Link>
                    <Link href="/perfil?editPassword=true" className={styles.footerLink}>Alterar senha</Link>
                    <Link href="/faq" className={styles.footerLink}>FAQ</Link>
                </footer>
            </div>
        </DivDashboard>
    )
}
