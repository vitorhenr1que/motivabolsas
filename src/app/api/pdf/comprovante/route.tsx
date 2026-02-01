import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    renderToBuffer,
} from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaymentStatus = "SUCESSO" | "PENDENTE" | "FALHOU";

interface ReceiptData {
    amount: number;
    status: PaymentStatus;
    method: string;

    lastUpdate?: string;
    payerName: string;

    startedAt?: string;
    succeededAt?: string;

    description?: string;
    code: string;
}

const formatMoney = (value: number) =>
    value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });

const formatDate = (value?: string) => {
    if (!value) return "";
    // Garantir que pegamos apenas a parte da data se for um ISO string
    const dateOnly = value.split("T")[0];
    const parts = dateOnly.split("-");

    // Se estiver no formato YYYY-MM-DD
    if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    const d = new Date(value);
    return Number.isNaN(d.getTime())
        ? value
        : d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
};

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#f8fafc",
        padding: 40,
        fontFamily: "Helvetica",
        color: "#334155",
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 8,
        padding: 32,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        paddingBottom: 24,
    },
    logoContainer: {
        width: 60,
        height: 60,
        marginRight: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
    },
    brandInfo: {
        justifyContent: "center",
    },
    brandName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#0f172a",
        marginBottom: 2,
    },
    brandSubtitle: {
        fontSize: 10,
        color: "#64748b",
    },
    paymentSection: {
        marginBottom: 32,
    },
    paymentLabel: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#64748b",
        letterSpacing: 1.5,
        textTransform: "uppercase",
        marginBottom: 8,
    },
    heroRow: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    currency: {
        fontSize: 16,
        fontWeight: "medium",
        color: "#64748b",
        marginRight: 4,
    },
    amountBig: {
        fontSize: 36,
        fontWeight: "extrabold",
        color: "#0f172a",
    },
    pill: {
        marginLeft: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: "#dcfce7",
        alignSelf: "center",
    },
    pillTextSuccess: {
        color: "#166534",
        fontSize: 10,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    infoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 24, // Note: gap might not work in all react-pdf versions, using margins instead
        marginBottom: 32,
    },
    infoCol: {
        width: "30%",
        marginRight: "3%",
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 10,
        color: "#64748b",
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 12,
        fontWeight: "semibold",
        color: "#0f172a",
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#0f172a",
        marginBottom: 16,
        marginTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        paddingBottom: 8,
    },
    timelineItem: {
        flexDirection: "row",
        marginBottom: 12,
        alignItems: "center",
    },
    timelineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#cbd5e1",
        marginRight: 12,
    },
    timelineDotActive: {
        backgroundColor: "#10b981",
    },
    timelineContent: {
        flex: 1,
    },
    timelineTitle: {
        fontSize: 11,
        fontWeight: "medium",
        color: "#0f172a",
    },
    timelineDate: {
        fontSize: 10,
        color: "#64748b",
    },
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    tableKey: {
        fontSize: 11,
        color: "#64748b",
    },
    tableValue: {
        fontSize: 11,
        fontWeight: "semibold",
        color: "#0f172a",
    },
    footer: {
        marginTop: 40,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: "#e2e8f0",
        alignItems: "center",
    },
    auth: {
        fontFamily: "Courier",
        fontSize: 9,
        color: "#94a3b8",
        marginBottom: 4,
    },
    footerLegal: {
        fontSize: 8,
        color: "#cbd5e1",
        textAlign: "center",
    },
});

const ReceiptPDF = ({
    data,
    logo,
}: {
    data: ReceiptData;
    logo: string;
}) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.card}>
                    {/* Marca */}
                    <View style={styles.brandRow}>
                        <View style={styles.logoContainer}>
                            <Image src={logo} style={styles.logo} />
                        </View>
                        <View style={styles.brandInfo}>
                            <Text style={styles.brandName}>Motiva Bolsas</Text>
                            <Text style={styles.brandSubtitle}>
                                Comprovante de Pagamento
                            </Text>
                        </View>
                    </View>

                    {/* Pagamento */}
                    <View style={styles.paymentSection}>
                        <Text style={styles.paymentLabel}>VALOR PAGO</Text>
                        <View style={styles.heroRow}>
                            <Text style={styles.currency}>R$</Text>
                            <Text style={styles.amountBig}>
                                {data.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </Text>
                            <View style={styles.pill}>
                                <Text style={styles.pillTextSuccess}>SUCESSO</Text>
                            </View>
                        </View>
                    </View>

                    {/* Informações Principais */}
                    <View style={styles.infoGrid}>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoTitle}>Pagador</Text>
                            <Text style={styles.infoValue}>{data.payerName}</Text>
                        </View>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoTitle}>Método</Text>
                            <Text style={styles.infoValue}>{data.method}</Text>
                        </View>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoTitle}>Data do Pagamento</Text>
                            <Text style={styles.infoValue}>
                                {formatDate(data.succeededAt)}
                            </Text>
                        </View>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoTitle}>Referência</Text>
                            <Text style={styles.infoValue}>{data.code}</Text>
                        </View>
                    </View>

                    {/* Linha do tempo */}
                    <Text style={styles.sectionTitle}>Histórico</Text>

                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, styles.timelineDotActive]} />
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>Pagamento Aprovado</Text>
                            <Text style={styles.timelineDate}>
                                {formatDate(data.succeededAt)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.timelineItem}>
                        <View style={styles.timelineDot} />
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>Solicitação Criada</Text>
                            <Text style={styles.timelineDate}>
                                {formatDate(data.startedAt)}
                            </Text>
                        </View>
                    </View>

                    {/* Detalhes */}
                    <Text style={styles.sectionTitle}>Resumo Financeiro</Text>

                    <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Descrição</Text>
                        <Text style={styles.tableValue}>{data.description || "Serviços Educacionais"}</Text>
                    </View>

                    <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Valor Original</Text>
                        <Text style={styles.tableValue}>
                            {formatMoney(data.amount)}
                        </Text>
                    </View>

                    <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                        <Text style={[styles.tableKey, { fontWeight: 'bold', color: '#0f172a' }]}>Total Pago</Text>
                        <Text style={[styles.tableValue, { fontSize: 14 }]}>
                            {formatMoney(data.amount)}
                        </Text>
                    </View>

                    {/* Rodapé */}
                    <View style={styles.footer}>
                        <Text style={styles.auth}>
                            ID DA TRANSAÇÃO: {data.code}
                        </Text>
                        <Text style={styles.footerLegal}>
                            Este documento serve como comprovante oficial de pagamento para o Motiva Bolsas.
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as ReceiptData;

        if (!body?.code || !body?.payerName) {
            return NextResponse.json(
                { error: "Dados inválidos" },
                { status: 400 }
            );
        }

        // Logo em base64 (seguro para serverless)
        const logoPath = path.join(process.cwd(), "src", "app", "public", "logo.png");
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = `data:image/png;base64,${logoBuffer.toString(
            "base64"
        )}`;

        const pdf = await renderToBuffer(
            <ReceiptPDF data={body} logo={logoBase64} />
        );

        return new NextResponse(new Uint8Array(pdf), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="Comprovante_${body.code}.pdf"`,
            },
        });
    } catch (err: any) {
        console.error("Erro detalhado ao gerar PDF:", err);
        return NextResponse.json(
            { error: "Erro ao gerar comprovante: " + (err.message || String(err)) },
            { status: 500 }
        );
    }
}
