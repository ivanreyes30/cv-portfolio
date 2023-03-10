import { Request, Response, NextFunction } from 'express'
import { Token, EncryptedToken } from '@/interfaces/AuthInterface'
import Controller from '@/controllers/Controller'
import AuthService from '@/services/AuthService'

class AuthController extends Controller
{
    protected service = new AuthService()
    
    public async index (request: Request, response: Response, next: NextFunction): Promise<void>
    {
        try {
            this.responseHandler(request, response, 200, 'test')
        } catch (error) {
            next(error)
        }
    }

    public async login (request: Request, response: Response, next: NextFunction): Promise<void>
    {
        try {
            const { encrypted_token, token }: EncryptedToken = await this.service.login(request)
            this.responseHandlerWithCookie(request, response, 200, token, encrypted_token)
        } catch (error) {
            next(error)
        }
    }

    public async token (request: Request, response: Response, next: NextFunction): Promise<void>
    {
        try {
            const token: Token = await this.service.token(request)
            this.responseHandler(request, response, 200, token)
        } catch (error) {
            next(error)
        }
    }

    public async refreshToken (request: Request, response: Response, next: NextFunction): Promise<void>
    {
        try {
            const token: Token = await this.service.refreshToken(request)
            this.responseHandler(request, response, 200, token)
        } catch (error) {
            next(error)
        }
    }
}

export default AuthController