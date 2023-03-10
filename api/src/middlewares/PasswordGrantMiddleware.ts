import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import HttpException from '@/core/HttpException'

const PasswordGrantMiddleware = (request: Request, response: Response, next: NextFunction) => {
    passport.authenticate('password_grant', { session: false },
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

export default PasswordGrantMiddleware