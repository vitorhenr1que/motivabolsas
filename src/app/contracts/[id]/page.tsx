"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import { useRouter } from "next/navigation";
import { PiCheckCircleFill, PiArrowLeftBold, PiFilePdfBold } from "react-icons/pi";
import { Loading } from "../../components/Loading";

export default function ContractPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const contractId = params.id;
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [contractStatus, setContractStatus] = useState<string>("DRAFT");
    const [signedAt, setSignedAt] = useState<string | null>(null);

    // PDF original (reexportado)
    const pdfUrl = useMemo(() => `/api/contracts/${contractId}/pdf`, [contractId]);

    const fetchContractData = async () => {
        try {
            const res = await fetch(`/api/contracts/${contractId}`);
            if (res.ok) {
                const data = await res.json();
                setContractStatus(data.status);
                setSignedAt(data.signedAt);
            } else if (res.status === 401) {
                router.push('/login');
            }
        } catch (error) {
            console.error("Erro ao carregar contrato:", error);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        fetchContractData();
    }, [contractId]);

    async function sign() {
        try {
            setLoading(true);

            const res = await fetch(`/api/contracts/${contractId}/sign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    consentText: "Declaro que li e concordo integralmente com o conteúdo deste contrato e o assino eletronicamente."
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));

                if (res.status === 401) {
                    alert("Sessão expirada. Por favor, faça login novamente.");
                    router.push('/login');
                    return;
                }

                if (res.status === 409) {
                    alert("O contrato foi alterado após a geração. Por favor, volte ao painel e gere um novo contrato.");
                    router.push('/dashboard');
                    return;
                }

                alert(err?.error ?? "Falha ao assinar contrato.");
                return;
            }

            // Baixar o PDF assinado automaticamente para o aluno guardar
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Contrato_Assinado_Motiva_Bolsas.pdf`;
            a.click();
            URL.revokeObjectURL(url);

            // Atualiza server-side e busca dados atualizados (para pegar o signedAt)
            router.refresh();
            await fetchContractData();

            alert("Contrato assinado com sucesso!");
            router.push('/dashboard');

        } catch (error) {
            console.error("Erro na assinatura:", error);
            alert("Ocorreu um erro ao processar a assinatura. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    if (pageLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
                <p style={{ color: '#64748b' }}>Carregando contrato...</p>
            </div>
        );
    }

    const isSigned = contractStatus === "SIGNED";

    return (
        <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '2rem',
            display: 'grid',
            gap: '1.5rem',
            fontFamily: 'sans-serif'
        }}>
            <header style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ color: '#0f172a', fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Assinatura de Contrato</h1>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                        {isSigned ? "Este contrato já foi assinado eletronicamente." : "Por favor, revise os termos abaixo antes de assinar."}
                    </p>
                </div>
                {isSigned && (
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            padding: '0.5rem 1rem',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: 600
                        }}>
                            <PiCheckCircleFill />
                            Contrato Assinado
                        </div>
                        {signedAt && (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Assinado em: {new Date(signedAt).toLocaleString('pt-BR')}
                            </span>
                        )}
                    </div>
                )}
            </header>

            <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                height: '70vh',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                backgroundColor: '#fff',
                position: 'relative',
                display: 'block'
            }}>
                <iframe
                    src={`${pdfUrl}#view=FitH&toolbar=0`}
                    style={{
                        width: "100%",
                        height: "100%",
                        minHeight: "100%",
                        border: "none",
                        display: "block"
                    }}
                    title="Visualização do Contrato"
                />
            </div>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        fontSize: '0.875rem',
                        color: '#0f172a',
                        textDecoration: 'underline',
                        fontWeight: 500
                    }}
                >
                    Não consegue visualizar? Clique aqui para abrir o contrato em tela cheia.
                </a>
            </div>

            {!isSigned ? (
                <>
                    <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <label style={{
                            display: "flex",
                            gap: 12,
                            alignItems: "flex-start",
                            cursor: 'pointer',
                            userSelect: 'none'
                        }}>
                            <input
                                type="checkbox"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                style={{ marginTop: '4px', width: '18px', height: '18px' }}
                            />
                            <span style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.5 }}>
                                Li e concordo integralmente com todos os termos e cláusulas apresentados no contrato acima,
                                autorizando a emissão da minha assinatura eletrônica para este documento.
                            </span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => router.push('/dashboard')}
                            style={{
                                padding: "0.75rem 1.5rem",
                                borderRadius: 8,
                                border: "1px solid #e2e8f0",
                                backgroundColor: '#fff',
                                color: '#64748b',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <PiArrowLeftBold />
                            Voltar ao Painel
                        </button>
                        <button
                            onClick={sign}
                            disabled={!accepted || loading}
                            style={{
                                padding: "0.75rem 2rem",
                                borderRadius: 8,
                                border: "none",
                                backgroundColor: '#0f172a',
                                color: '#fff',
                                fontWeight: 600,
                                opacity: !accepted || loading ? 0.6 : 1,
                                cursor: !accepted || loading ? "not-allowed" : "pointer",
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {loading ? <Loading /> : "Assinar e baixar PDF"}
                        </button>
                    </div>
                </>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => router.push('/dashboard')}
                        style={{
                            padding: "0.75rem 1.5rem",
                            borderRadius: 8,
                            border: "none",
                            backgroundColor: '#0f172a',
                            color: '#fff',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <PiArrowLeftBold />
                        Voltar ao Painel
                    </button>
                </div>
            )}
        </div>
    );
}
