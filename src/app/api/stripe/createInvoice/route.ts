import { stripe } from "@/app/services/stripe";

export async function POST(request: Request){
    const { customerId, items  } = await request.json()

    try {
        // Criar um novo item de fatura
        const invoiceItem = await stripe.invoiceItems.create({
          customer: customerId, // ID do cliente
          amount: 8000, // Valor em centavos (e.g., 1000 = $10.00)
          currency: 'brl', // ou a moeda desejada
          description: items.description,
        });
  
        // Criar a fatura com o item adicionado
        const invoice = await stripe.invoices.create({
          customer: customerId,
          auto_advance: true, // Envia a fatura automaticamente
        });
  
        return Response.json({invoice}, {status: 200})
      } catch (error: any) {
        return Response.json({error: error.message}, {status: 500})
      }
    } 
  