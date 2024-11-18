import { api } from "@/app/services/api"
import { stripe } from "@/app/services/stripe"
import { headers } from "next/headers"

const secret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request){
try{
        const body = await req.text()
    const signature = headers().get("stripe-signature")

    if(!secret || !signature) {
        throw new Error("Missing secret or signature")
    }
    const event = stripe.webhooks.constructEvent(body, signature,secret)

    switch (event.type){
        case "checkout.session.completed":
            if(event.data.object.payment_status === "paid"){
                //Pagamento por cartão
                const testId = event.data.object.metadata?.testId
                console.log("Pagamento por cartão com sucesso: ", testId)
                console.log("ID.bolsafacil de quem fez a requisição: ", event.data.object.client_reference_id)
                await api.put('/update-payment', {
                    id: event.data.object.client_reference_id
                })
            }
            if(event.data.object.payment_status === "unpaid" && event.data.object.payment_intent){
                //Pagamento por boleto
                const paymentIntent = await stripe.paymentIntents.retrieve(event.data.object.payment_intent.toString())
                
                const hostedVoucherUrl = paymentIntent.next_action?.boleto_display_details?.hosted_voucher_url // link de pagamento do boleto

                if(hostedVoucherUrl){
                    const userEmail = event.data.object.customer_details?.email
                    console.log("Gerou o boleto e o link é: ", hostedVoucherUrl);
                }
                
                
            }
        break;

        case "checkout.session.expired":
            if(event.data.object.payment_status === "unpaid"){
                // O cliente saiu do checkout e expirou :(
                const testId = event.data.object.metadata?.testId
                console.log("Checkout expirado: ", testId)
            }
        break;

        case "checkout.session.async_payment_succeeded":
            if(event.data.object.payment_status === "paid"){
                //(async_payment_succeded) O cliente pagou o boleto e o pagamento foi confirmado
                const testId = event.data.object.metadata?.testId
                console.log("Pagamento por boleto confirmado: ", testId)
            }
        break;

        case "checkout.session.async_payment_failed":
            if(event.data.object.payment_status === "unpaid"){
                //(async_payment_failed) O cliente não pagou o boleto e ele venceu
                const testId = event.data.object.metadata?.testId
                console.log("O pagamento do boleto falhou: ", testId)
            }
        break;

        case "customer.subscription.updated":
            //O cliente cancelou o plano de assinatura (caso tenha)
        break;
    }
    return Response.json({result: event, ok: true}, {status: 200})
}catch(err){
    Response.json({
        message: `Stripe Webhook Error: ${err}`, ok: false}, {status: 500})
}
} 