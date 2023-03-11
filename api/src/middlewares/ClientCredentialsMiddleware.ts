import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import HttpException from '@/core/HttpException'

const ClientCredentialsMiddleware = (request: Request, response: Response, next: NextFunction) => {
    passport.authenticate('client_credentials', { session: false },
        (error) => {
            try {
                if (error) throw new HttpException(401, error)
                next()
            } catch (error) {
                next(error)
            }
        }
    )(request, response, next)
}

export default ClientCredentialsMiddleware