import { prisma } from "@/app/services/prisma";
import { registerInterPayment } from "@/app/lib/payment-period";
import axios from "axios";

export const runtime = "nodejs";

type CobrancaEvent = {
    codigoSolicitacao: string;
    seuNumero: string;
    situacao: string;
};

function notifyWebhook(path: string, body: unknown) {
    axios.post(`https://webhook.fazag.edu.br:8443/webhook/${path}`, body, {
        timeout: 5000,
    }).catch(() => {
        console.log(`Processo concluído, mas não foi possível notificar o webhook N8N ${path}.`);
    });
}

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const events: CobrancaEvent[] = Array.isArray(payload) ? payload : [payload];

        for (const event of events) {
            if (event.situacao === "RECEBIDO" || event.situacao === "MARCADO_RECEBIDO") {
                const refreshPayment = await registerInterPayment(event.codigoSolicitacao, event.seuNumero);
                if (refreshPayment) {
                    notifyWebhook("recebido", {
                        getPaidUser: refreshPayment,
                        event: Array.isArray(payload) ? [event] : event,
                    });
                }
            } else if (event.situacao === "A_RECEBER") {
                const userInfo = await prisma.user.findUnique({
                    where: { cpf: event.seuNumero },
                    select: {
                        id: true,
                        phone: true,
                        name: true,
                        course: true,
                        instituition: true,
                        cpf: true,
                        discount: true,
                        renovacao: true,
                        createdAt: true,
                        addresses: { select: { city: true } },
                    },
                });
                notifyWebhook("a-receber", { userInfo, event: Array.isArray(payload) ? [event] : event });
            }
        }

        return Response.json(payload, { status: 200 });
    } catch (error) {
        console.error("Erro ao registrar pagamento do Inter:", error);
        return Response.json({ error: "Falha ao registrar evento de cobrança." }, { status: 500 });
    }
}
