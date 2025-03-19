import nodemailer from 'nodemailer'

const email = process.env.USERMAIL
const pass = process.env.PASSMAIL

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: email,
        pass,
    }
})

export const mailOptions = {
    from: email,
    to: email
}