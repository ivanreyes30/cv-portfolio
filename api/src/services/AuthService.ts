import { Request } from 'express'
import { AUTH_ROUTE } from '@/config/endpoints'
import Passport from '@/lib/Passport'
import AuthRepository from '@/repositories/AuthRepository'
import HttpRequest from '@/core/HttpRequest'
import HttpException from '@/core/HttpException'

class AuthService
{
    protected httpRequest = new HttpRequest()
    
    protected repository = new AuthRepository()

    protected passport = new Passport()

    public async login (request: Request)
    {
        const { baseUrl, token } = AUTH_ROUTE
        const { email_address, password } = request.body

        const payload = {
            grant_type: 'password',
            username: email_address,
            password
        }

        const authToken = await this.httpRequest.post(`${baseUrl}${token}`, payload)

        console.log(authToken)

        // console.log(payload)
    }

    public async token (request: Request)
    {
        const {
            grant_type,
            username,
            password
        } = request.body

        let auth = null

        switch (grant_type) {
            case 'password': {
                const validated = await this.repository.validateUser(username, password)

                if (!validated) throw new HttpException(401, 'Invalid Account.')

                auth = validated
            }
        }

        const token = this.passport.generateToken(auth)

        return token
    }

}

export default AuthService