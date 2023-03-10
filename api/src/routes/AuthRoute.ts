import { Router } from 'express'
import { AUTH_ROUTE } from '@/config/endpoints'
import RouteInterface from '@/interfaces/RouteInterface'
import AuthController from '@/controllers/AuthController'
import LoginRequest from '@/requests/auth/LoginRequest'
import TokenRequest from '@/requests/auth/TokenRequest'
import RefreshTokenRequest from '@/requests/auth/RefreshTokenRequest'
import PasswordGrantMiddleware from '@/middlewares/PasswordGrantMiddleware'
import RefreshTokenMiddleware from '@/middlewares/RefreshTokenMiddleware'

class AuthRoute implements RouteInterface
{
    public path: string = AUTH_ROUTE.baseUrl

    public router: Router = Router()

    private authController: AuthController = new AuthController()

    constructor ()
    {
        this.initializeRoutes()
    }

    private initializeRoutes (): void
    {
        const { 
            login,
            token,
            refreshToken
        } = AUTH_ROUTE

        this.router.get('/', [PasswordGrantMiddleware], this.authController.index.bind(this.authController))
        this.router.post(login, LoginRequest, this.authController.login.bind(this.authController))
        this.router.post(token, TokenRequest, this.authController.token.bind(this.authController))
        this.router.post(refreshToken, [RefreshTokenMiddleware, RefreshTokenRequest], this.authController.refreshToken.bind(this.authController))
    }
}

export default AuthRoute