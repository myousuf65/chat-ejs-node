import aws from "aws-sdk"
import dotenv from "dotenv"

const SES_CONFIG = {
    access_key_id: process.env.AWS_ACCESS_KEY_ID,
    secret_key: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
}

const AWS_SES = new AWS.SES(SES_CONFIG)

// const sendEmail = 
