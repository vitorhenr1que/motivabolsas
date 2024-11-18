import { stripe } from "@/app/services/stripe"

export async function POST(req: Request){

    const {userId, customerId} = await req.json()
    
    const price = process.env.STRIPE_PRICE_ID

    console.log("create-checkout: pegou o userId: ", userId)
    console.log("create-checkout: pegou o customerId: ", customerId)
    console.log("price: ", price)

    try{
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: price,
                    quantity: 1,
                },
            ],
            mode: "payment",
            payment_method_types: ["card", "boleto"],
            success_url: `${req.headers.get("origin")}/sucesso`,
            cancel_url: `${req.headers.get("origin")}/`,
            customer: customerId,
            client_reference_id: userId,
            metadata: {
                userId,
            }
        })
        return Response.json({sessionId: session.id}, {status: 200})
    }catch(e: any){
        e.message
    }
}
