import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export function createJWT(user){
  return jwt.sign(user, process.env.SECRET_KEY) 
}

export function verifyJWT(token){
  return jwt.verify(token, process.env.SECRET_KEY)
}


