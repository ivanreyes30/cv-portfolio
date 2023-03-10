import { Request, Response } from 'express'
import { COOKIE_EXPIRES } from '@/config/cache'
import Passport from '@/lib/Passport'

abstract class Controller
{
    private passport = new Passport()

    protected responseHandler (request: Request, response: Response, status: number, json: any): Response
    {
        const { _new_token } = request.cookies

        if (_new_token) {
            const { refresh_token_expires } = <any>request.user
            const expiration = this.passport.getLeftTimeTokenExpirationSeconds(refresh_token_expires)
            const maxAge = expiration * 1000
            return response.status(status).cookie('_token', _new_token, { httpOnly: true, maxAge, secure: false }).json(json)
        }

        return response.status(status).json(json)
    }

    protected responseHandlerWithCookie (request: Request, response: Response, status: number, json: any, cookie: string): Response
    {
        return response.status(status).cookie('_token', cookie, { httpOnly: true, maxAge: COOKIE_EXPIRES, secure: false }).json(json)
    }
}

export default Controller