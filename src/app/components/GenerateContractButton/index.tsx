"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/services/api";
import { PiScrollBold } from "react-icons/pi";
import { Loading } from "../Loading";

interface GenerateContractButtonProps {
    userData: {
        name: string;
        cpf: string;
        course: string;
        discount: string;
    };
    semestre_atual: string;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Componente de botão para disparar a geração de contrato.
 * O redirecionamento ocorre automaticamente após o sucesso.
 */
export default function GenerateContractButton({
    userData,
    semestre_atual,
    className,
    style,
}: GenerateContractButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleGenerate() {
        if (loading) return;

        setLoading(true);
        try {
            const payload = {
                name: userData.name,
                cpf: userData.cpf,
                semestre_atual: semestre_atual,
                course: userData.course,
                discount: userData.discount,
                dataAtual: new Date().toLocaleDateString("pt-BR"),
            };

            // Chamada para a API (sem userId, identificado pelo JWT no cookie)
            const response = await api.post("/contracts/generate", payload);

            if (response.data && response.data.pageUrl) {
                router.push(response.data.pageUrl);
            } else if (response.data && response.data.contractId) {
                router.push(`/contracts/${response.data.contractId}`);
            } else {
                throw new Error("O servidor não retornou a URL de destino");
            }
        } catch (error: any) {
            console.error("Erro ao gerar contrato:", error);

            if (error.response?.status === 401) {
                alert("Sessão expirada. Por favor, faça login novamente.");
                router.push("/login");
                return;
            }

            const errorMsg =
                error.response?.data?.error || "Erro ao preparar o contrato. Tente novamente.";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleGenerate}
            disabled={loading}
            className={className}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%",
                ...style,
            }}
        >
            {loading ? (
                <Loading />
            ) : (
                <>
                    <PiScrollBold />
                    <span>Gerar contrato</span>
                </>
            )}
        </button>
    );
}
