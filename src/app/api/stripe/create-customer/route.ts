import { stripe } from "@/app/services/stripe";

export async function POST(request: Request){
    const {email, name, cpf} = await request.json()

    try{
        const customer = await stripe.customers.create({
            email: email,
            name: name,
            address: {
                country: 'BR'
            },
            metadata: {
                cpf: cpf
            }
        })
        return Response.json({customer}, {status: 200})
    }catch(error: any){
        return Response.json({error: error.message}, {status: 500})
    }
}