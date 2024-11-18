
import { prisma } from "@/app/services/prisma";


export async function PUT(request: Request){
    const { id } = await request.json()
   
    try {
        const update = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                currentPayment: true
            }
        })
    
        return Response.json({update}, {status: 200})
    }
    catch(err){
       return Response.json({err}, {status: 500})
    }
    
}
