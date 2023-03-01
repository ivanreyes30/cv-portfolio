import { Request, Response, NextFunction } from 'express'
import AuthService from '@/services/AuthService'
// import { hash } from 'bcrypt'

class AuthController 
{
    protected service = new AuthService()

    public async login (request: Request, response: Response, next: NextFunction)
    {
        try {
            const auth = await this.service.login(request)
            // console.log(auth)
        } catch (error) {
            next(error)
        }
        // console.log(auth)
        // hash(request.body.password, 10, (err, hash) => {
        //     console.log(hash, 'asd')
        // })
    }

    public async token (request: Request, response: Response, next: NextFunction)
    {
        try {
            const token = await this.service.token(request)
            response.status(200).json(token)
        } catch (error) {
            next(error)
        }
        // response.status(200).json({ status: true, message: 'hello world' })
    }
}

export default AuthController