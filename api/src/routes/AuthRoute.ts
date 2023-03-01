import { Router, Request, Response } from 'express'
import { AUTH_ROUTE } from '@/config/endpoints'
// import { Router, Request, Response, NextFunction } from 'express'
import RouteInterface from '@/interfaces/RouteInterface'
import AuthController from '@/controllers/AuthController'
import LoginRequest from '@/requests/auth/LoginRequest'
import TokenRequest from '@/requests/auth/TokenRequest'
// import AuthMiddleware from '@/middlewares/AuthMiddleware'
// import passport from 'passport'

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
            token
        } = AUTH_ROUTE

        this.router.post(login, LoginRequest, this.authController.login.bind(this.authController))
        this.router.post(token, TokenRequest, this.authController.token.bind(this.authController))
        // passport.authenticate('jwt', { session: false })
        // this.router.get(
        //     '/test',
        //     passport.authenticate('jwt', { session: false }, (error, token) => {
        //         console.log(token)
        //     })
        // )

        // this.router.get('/test2', (req, res ) => {
        //     console.log('test2')
        // })
    }
}

export default AuthRoute