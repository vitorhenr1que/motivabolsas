'use server'
 
import axios from "axios"
import { redirect } from "next/navigation"



export async function authenticate(currentState: any, formData: FormData): Promise<string> {
    const email = formData.get('email')
    const password = formData.get('password')

   const res = await axios.post('/api/signin', {
        email,
        password
    })

    const json = await res.data
    if(res.data){
        redirect("/dashboard")
    }
    else{
        return res.statusText;
    }
}