import express, { Application } from 'express'
import { NODE_ENV, PORT } from '@/config'

import AuthRoute from '@/routes/AuthRoute'
import Passport from '@/lib/Passport'
import Logger from '@/lib/Logger'

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

        // Codes for Body Parser. I put this because the json body parameter is undefined without these codes
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: false }))

        // Initialize Methods
        this.initializeRoutesAndControllers()
		this.initializePassport()
        this.initializeLogger()
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

    private initializeLogger (): void
    {
        this.logger.initializeLogger()
    }

    public listen (): void
    {
        this.app.listen(this.port, () => console.log(`Listening on port ${this.port}`))
    }
}

export default App