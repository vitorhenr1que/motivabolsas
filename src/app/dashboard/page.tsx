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

type ContractStatus = "DRAFT" | "SENT" | "SIGNED" | "REFUSED" | "EXPIRED";

interface ContractState {
    hasContract: boolean;
    isSigned: boolean;
    contract: {
        id: string;
        status: ContractStatus;
        signedAt: string | null;
        createdAt: string;
    } | null;
}

function getContractDiscount(user: userDataProps) {
    if (!user.discount || user.discount === "null" || user.discount === "") {
        const coursesWithThirtyPercentDiscount = ["psicologia", "odontologia", "direito"];
        const hasThirtyPercentDiscount = coursesWithThirtyPercentDiscount.some((course) =>
            user.course?.toLowerCase().includes(course)
        );

        return hasThirtyPercentDiscount ? "30%" : "40%";
    }

    return user.discount.includes('%') ? user.discount : `${user.discount}%`;
}

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<userDataProps>()
    const [loading, setLoading] = useState(true)
    const [loadingButton, setLoadingButton] = useState(false)
    const [disablePaymentButton, setDisablePaymentButton] = useState(false)
    const [checkingBoletos, setCheckingBoletos] = useState(false)
    const [paymentMessage, setPaymentMessage] = useState("")
    const [contractState, setContractState] = useState<ContractState | null>(null)
    const { setUser: setGlobalUser } = useUser()

    function handleLogOut() {
        setGlobalUser(undefined)
        SignOut()
    }

    function getCurrentSemester() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // Janeiro = 0, Dezembro = 11

  const semester = month < 6 ? 1 : 2;

  return `${year}.${semester}`;
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

                const contractResponse = await api.get('/contracts/status')
                let contractData = contractResponse.data as ContractState
                setContractState(contractData)

                // Usuários que já fizeram o primeiro pagamento precisam ter um
                // contrato disponível para assinatura. A API reaproveita um SENT
                // existente, portanto acessos repetidos não duplicam contratos.
                if (userData.firstPayment === true && !contractData.isSigned) {
                    try {
                        await api.post('/contracts/generate', {
                            name: userData.name,
                            cpf: userData.cpf,
                            semestre_atual: getCurrentSemester(),
                            course: userData.course || "",
                            discount: getContractDiscount(userData),
                            dataAtual: new Date().toLocaleDateString("pt-BR"),
                        })

                        const updatedContractResponse = await api.get('/contracts/status')
                        contractData = updatedContractResponse.data as ContractState
                        setContractState(contractData)
                    } catch (contractError: any) {
                        console.error('Falha ao criar contrato automático:', contractError.message)
                    }
                }

                if (userData && !userData.currentPayment && contractData.isSigned) {
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
    const hasContract = contractState?.hasContract === true
    const isContractSigned = contractState?.isSigned === true
    const pendingContractId = !isContractSigned ? contractState?.contract?.id : undefined
    const dashboardStatus = isPaid ? "paid" : isContractSigned ? "payment" : "contract"
    const displayDiscount = (() => {
        if (!user) return '0%';
        return getContractDiscount(user);
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
                        {dashboardStatus === "paid" ? (
                            <div className={`${styles.statusBadge} ${styles.active}`}>
                                <PiCheckCircleFill className={styles.icon} />
                                <div className={styles.texts}>
                                    <strong>Status: Bolsa Ativa e Confirmada</strong>
                                    <span>Tudo certo! Você já é um aluno Motiva Bolsas.</span>
                                </div>
                            </div>
                        ) : dashboardStatus === "contract" ? (
                            <div className={`${styles.statusBadge} ${styles.pending}`}>
                                <PiWarningCircleFill className={styles.icon} />
                                <div className={styles.texts}>
                                    <strong>Status: Aguardando Contrato</strong>
                                    <span>Gere e assine seu contrato para liberar os boletos.</span>
                                </div>
                            </div>
                        ) : (
                            <div className={`${styles.statusBadge} ${styles.pending}`}>
                                <PiWarningCircleFill className={styles.icon} />
                                <div className={styles.texts}>
                                    <strong>Status: Aguardando Pagamento</strong>
                                    <span>Contrato assinado. Agora os boletos estão liberados.</span>
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
                                    {!isContractSigned ? (
                                        <>
                                            <h3>{hasContract ? "Contrato pendente de assinatura" : "Ação pendente: gerar contrato"}</h3>
                                            <p>
                                                {hasContract
                                                    ? "Seu contrato já foi gerado. Para liberar os boletos, revise e assine o documento."
                                                    : "Para oficializar sua bolsa, primeiro gere e assine o contrato. Os boletos serão liberados somente depois da assinatura."}
                                            </p>

                                            <div className={styles.actionButtons}>
                                                {hasContract && pendingContractId ? (
                                                    <div className={styles.actionButtonSlot}>
                                                        <Link href={`/contracts/${pendingContractId}`} className={`${styles.btnPrimary} ${styles.contractButton}`}>
                                                            <PiScrollBold /> Assinar contrato
                                                        </Link>
                                                    </div>
                                                ) : user && (
                                                    <div className={styles.actionButtonSlot}>
                                                        <GenerateContractButton
                                                            userData={{
                                                                name: user.name,
                                                                cpf: user.cpf,
                                                                course: user.course || "",
                                                                discount: displayDiscount
                                                            }}
                                                            semestre_atual={getCurrentSemester()}
                                                            className={styles.btnPrimary}
                                                        />
                                                    </div>
                                                )}

                                                <div className={styles.actionButtonSlot}>
                                                    <Link href="/contato" className={styles.btnSecondary}>
                                                        Preciso de ajuda
                                                    </Link>
                                                </div>
                                            </div>

                                            <div className={styles.contractNotice}>
                                                <PiWarningCircleFill />
                                                <strong>Atenção:</strong>
                                                <span>Os boletos ficam disponíveis apenas depois que o contrato estiver assinado.</span>
                                            </div>
                                        </>
                                    ) : boletosList.length > 0 ? (
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
                                            <h3>Ação pendente: liberação da bolsa</h3>
                                            <p>Contrato assinado com sucesso. Agora realize o pagamento da taxa semestral de adesão para ativar sua bolsa.</p>

                                            <div className={styles.actionButtons}>
                                                <div className={styles.actionButtonSlot}>
                                                    <PaymentButton
                                                        user={user}
                                                        disabled={disablePaymentButton}
                                                        loading={checkingBoletos}
                                                    />
                                                </div>

                                                <div className={styles.actionButtonSlot}>
                                                    <Link href="/contato" className={styles.btnSecondary}>
                                                        Preciso de ajuda
                                                    </Link>
                                                </div>
                                            </div>

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
