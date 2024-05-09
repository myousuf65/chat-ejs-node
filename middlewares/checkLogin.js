import { verifyJWT } from "../jwt.js";

export function checkLogin(req, res, next){ 

  if(!req.cookies?.token){
    console.log('You have to sign in first')
    res.redirect('/auth')
  }else{
    const result = verifyJWT(req.cookies?.token)
    req.username = result['username']
    next()
  }


}
