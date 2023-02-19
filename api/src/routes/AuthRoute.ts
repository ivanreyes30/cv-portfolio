import { Router, Request } from 'express'
// import { Router, Request, Response, NextFunction } from 'express'
import RouteInterface from '@/interfaces/RouteInterface'
import AuthController from '@/controllers/AuthController'
// import AuthMiddleware from '@/middlewares/AuthMiddleware'
// import passport from 'passport'

class AuthRoute implements RouteInterface
{
    public path: string = '/auth'
    public router: Router = Router()
    private authController = new AuthController()

    constructor ()
    {
        this.initializeRoutes()
    }

    private initializeRoutes (): void
    {
        this.router.post('/login', (request: Request) => this.authController.login(request))
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