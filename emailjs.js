import dotenv from 'dotenv'
import emailjs from "@emailjs/nodejs"

dotenv.config()

const options = {
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
}
export function sendEmail(){

  // const templateParamas = {
  //   to_name: username,
  //   subject: 'Email Verification',
  //   message: verification_link,
  //   verify_email: email
  // }
  const templateParamas = {
    to_name: 'khan',
    subject: 'Email Verification',
    message: "some link",
    verify_email: 'feeds015@gmail.com'
  }

  emailjs.send(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_TEMPLATE_ID, templateParamas, options)
    .then(
      (response) => {
        console.log('SUCCESS!', response.status, response.text);
      },
      (error) => {
        console.log('FAILED...', error);
      },
    );
}
emailjs.init(options)
sendEmail()
