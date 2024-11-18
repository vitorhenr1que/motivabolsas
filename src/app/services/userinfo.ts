'use server'

import { cookies } from "next/headers"

export function userInfo(){
    const userMail = cookies().get('email')?.value
    return userMail
}

