'use server'

import { redirect } from "next/navigation"
import { api } from "../services/api"
import { cookies } from "next/headers"
import { useUser } from "../components/contexts/user-provider"




export default async function loginAction(
    _currentState: unknown,
    formData: FormData
) {
    const email = formData.get('email')
    const password = formData.get('password')

    const url = process.env.NEXT_PUBLIC_VERSION === 'production' ? "https://motivabolsas.com.br" : "http://localhost:3000"

    const res = await fetch(`${url}/api/signin`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })


    const json = await res.json()

    try {
        if (json.token !== "invalid") {
            //Definir sessão
            cookies().set({
                name: 'Authorization',
                value: json.token,
                httpOnly: true,
                secure: process.env.NEXT_PUBLIC_VERSION === 'production', // Sites http = false  // Sites https = true
                expires: Date.now() + 24 * 60 * 60 * 1000 * 3,
                path: '/',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7
            })
            cookies().set({
                name: 'email',
                value: json.user.email,
                httpOnly: true,
                secure: process.env.NEXT_PUBLIC_VERSION === 'production', // Sites http = false  // Sites https = true
                expires: Date.now() + 24 * 60 * 60 * 1000 * 3,
                path: '/',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7
            })
        }
    } catch (e: any) {
        console.log(e.message)
    }

    if (res.ok) {
        return redirect("/dashboard")
    }
    else {
        console.log('Entrou no erro')
        return json.error

    }

}