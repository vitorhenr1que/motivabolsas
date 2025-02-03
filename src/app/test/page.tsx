'use client'
import axios from "axios"
import https from 'https'
import fs from 'fs'
import { api } from "../services/api"
import { useUser } from "../components/contexts/user-provider"
import { useEffect } from "react"
import { getInterToken } from "../services/inter-token"


export default function test(){
    const {interToken, setInterToken} = useUser()
    async function handleTest(){
 
    }
   

    function token(){
        console.log(interToken)
    }
    useEffect(() => {
        setInterToken(getInterToken())
        console.log(interToken)
    }, [])
    return (
        <>
        <button onClick={() => handleTest()}>Gerar Token</button>
        <button onClick={() => token()}>Console</button>
        <p></p>
        </>
    )
}