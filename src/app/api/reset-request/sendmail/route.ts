import { transporter, mailOptions } from "../../../services/nodemailer";

export async function POST(req: Request){
    const {from, to} = mailOptions
    const {name, email, link} = await req.json()
    try {
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
                                Olá, ${name.split(' ')[0]}<br><br>
                                Recebemos uma solicitação para redefinir sua senha. Se foi você, clique no botão abaixo para continuar. Caso contrário, ignore este e-mail.
                            </p>
                            <div style="text-align: center;">
                                <a href="${link}" target="_blank" style="background-color: #edb539; color: #ffffff; text-decoration: none; font-size: 14px; padding: 12px 24px; border-radius: 5px; display: inline-block;">Redefinir Senha</a>
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
        return Response.json({message: "E-mail Enviado!"}, {status: 200})
    }catch(e){
        return Response.json(e, {status: 400})
    }
}