import { api } from '../../services/api'
import { prisma } from '../../services/prisma'
import crypto from 'crypto'
import { NextApiRequest } from 'next'
import { NextResponse } from 'next/server'
import { transporter, mailOptions } from '../../services/nodemailer'

export async function POST(request: Request) {
    console.log('testeeeeeeeeeeeeee')
    const { email } = await request.json()

    console.log(email)
    if (!email) {
        console.log('Entrou')
        return Response.json({ message: "E-mail Obrigatório" }, { status: 400 })
    }
    try {
        const getUser = await prisma.user.findUnique({
            where: {
                email: email
            },
            select: {
                email: true,
                name: true,
            }
        })
        if (!getUser?.email) {
            return Response.json({ message: "E-mail Inválido!" }, { status: 400 })
        }
        console.log(getUser, '<= email')
        const token = crypto.randomBytes(32).toString('hex') //Ex: fbe5d08a452082cf1376fbc52d166262098085b4b0e4440a7c8285dc762809a8
        const expiration = Date.now() + 1000 * 60 * 15 //Ex: 1742327534156
        if (getUser?.email) {
            console.log('entrou no expirationUpdate')
            const expirationUpdate = await prisma.user.update({
                where: {
                    email: email
                },
                data: {
                    tokenExpiration: `${expiration}`,
                    token: token
                }
            })
            console.log(expirationUpdate, 'TTTT')
            console.log("Expiration: ", expiration)
        }

        const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
        const resetLink = `${baseUrl}/redefinir-senha?email=${email}&token=${token}`;

        console.log({ name: getUser.name, email: getUser.email, link: resetLink })
        const { from } = mailOptions
        await transporter.sendMail({
            from: from,
            to: email,
            replyTo: from,
            text: '',
            subject: `Recuperação de Senha | Motiva Bolsas`,
            html: `<div style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td align="center">
                            <img style="width: 200px; margin-top: 50px;" src="https://www.motivabolsas.com.br/logo/logo.png" alt="Logo Motiva">
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="background-color: #fff; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                            <h1 style="color: #2093d1; margin: 0; font-size: 20px; ">Recuperação de Senha</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px; color: #333;">
                            <p style="font-size: 14px; margin-bottom: 20px;">
                                Olá, ${getUser.name.split(' ')[0]}<br><br>
                                Recebemos uma solicitação para redefinir sua senha. Se foi você, clique no botão abaixo para continuar. Caso contrário, ignore este e-mail.
                            </p>
                            <div style="text-align: center;">
                                <a href="${resetLink}" target="_blank" style="background-color: #edb539; color: #ffffff; text-decoration: none; font-size: 14px; padding: 12px 24px; border-radius: 5px; display: inline-block;">Redefinir Senha</a>
                            </div>
                            <p style="font-size: 14px; margin-top: 20px; color: #777;">
                                O link expira em 15 minutos. Se precisar de ajuda, entre em contato com o suporte.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="background-color: #2093d1; padding: 15px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                            <p style="color: #ffffff; font-size: 14px; margin: 0;">© 2025 Motiva Bolsas. Todos os direitos reservados.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>`
        })

        console.log(token)
        return Response.json(resetLink, { status: 200 }) //LEMBRAR DE ADICIONAR A VARIAVEL DE AMBIENTE NA VERCEL
    } catch (e: any) {
        if (e.code === "P2025") {
            return Response.json({ message: "E-mail Inválido" }, { status: 400 })
        }
        return Response.json(e, { status: 400 })
    }
}