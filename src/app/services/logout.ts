'use server'

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function SignOut(){
    cookies().delete('Authorization')
    cookies().delete('email')
    return redirect('/login')
}