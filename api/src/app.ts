import express, { Application } from 'express'
import { NODE_ENV, PORT } from '@/config'
import cookieParser from 'cookie-parser'
import AuthRoute from '@/routes/AuthRoute'
import Passport from '@/lib/Passport'
import Logger from '@/lib/Logger'
import ErrorMiddleware from '@/middlewares/ErrorMiddleware'

class App 
{
    private passport = new Passport()

    private logger = new Logger

    public app: Application

    public env: string

    public port: string | number

    constructor ()
    {
		this.app = express()
		this.port = PORT || 4000
		this.env = NODE_ENV || 'development'

        // Initialize Methods
        // this.initializeLogger()
        this.initializeCookieParser()
        this.initializeBodyParser()
        this.initializeRoutesAndControllers()
		this.initializePassport()
        this.initializeErrorHandling()
    }

    private initializeCookieParser(): void
    {
        // Codes for Cookie Parser. I put this because the cookie headers is undefined without this
        this.app.use(cookieParser())
    }


    private initializeBodyParser (): void
    {
        // Codes for Body Parser. I put this because the json body parameter is undefined without these codes
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: false }))
    }

    private initializeRoutesAndControllers (): void
    {
        [new AuthRoute()].forEach((route) => {
            this.app.use(route.path, route.router)
        })
    }

    private initializePassport (): void
    {
        this.passport.initializePassport()
    }

    private initializeErrorHandling (): void
    {
        this.app.use(ErrorMiddleware)
    }

    public listen (): void
    {
        this.app.listen(this.port, () => console.log(`Listening on port ${this.port}`))
    }
}

export default App