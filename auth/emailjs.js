import dotenv from 'dotenv'
import emailjs from "@emailjs/nodejs"

dotenv.config()

const options = {
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
}
export function sendEmail(username, verification_email, verification_link){

  const templateParamas = {
    to_name: username,
    subject: 'Email Verification',
    message: verification_link,
    verify_email: verification_email
  }

  return emailjs.send(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_TEMPLATE_ID, templateParamas, options)

}

// emailjs.init(options)
