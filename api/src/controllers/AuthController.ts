import { Request, Response, NextFunction } from 'express'
import axios from 'axios'
// import { hash } from 'bcrypt'

class AuthController 
{
    public login (request: Request, response: Response, next: NextFunction)
    {
        axios.post('http://localhost:3000/auth/token', { email_address: 'test@test.com', password: 'test' }).then((result) => {
            console.log(result)
        }).catch((error) => {
            console.log(error)
        })
        // hash(request.body.password, 10, (err, hash) => {
        //     console.log(hash, 'asd')
        // })
    }

    public token (request: Request, response: Response, next: NextFunction)
    {
        console.log('token')
    }
}

export default AuthController