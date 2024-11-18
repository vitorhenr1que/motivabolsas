import axios from "axios";

const url = process.env.NEXT_PUBLIC_VERSION === "production" ? "https://bolsa-facil.vercel.app" : "http://localhost:3000"
export const api = axios.create({
    baseURL: `${url}/api`
})