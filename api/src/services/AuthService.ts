import { Request } from 'express'
import { AUTH_ROUTE } from '@/config/endpoints'
import { EncryptedToken, Token, User } from '@/interfaces/AuthInterface'
import { DateTime } from 'luxon'
import { ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } from '@/config/cache'
import Crypt from '@/lib/Crypt'
import Passport from '@/lib/Passport'
import AuthRepository from '@/repositories/AuthRepository'
import HttpRequest from '@/core/HttpRequest'
import HttpException from '@/core/HttpException'
import Redis from '@/lib/Redis'

class AuthService
{
    private httpRequest = new HttpRequest()
    
    private repository = new AuthRepository()

    private passport = new Passport()

    private crypt = new Crypt()

    private cache = new Redis()

    public async login (request: Request): Promise<EncryptedToken>
    {
        const { baseUrl, token } = AUTH_ROUTE
        const { email_address, password } = request.body

        const payload = {
            grant_type: 'password',
            username: email_address,
            password
        }

        const { data } = await this.httpRequest.post(`${baseUrl}${token}`, payload)

        return {
            encrypted_token: this.crypt.encrypt(JSON.stringify(data)),
            token: data
        }
    }

    public async token (request: Request): Promise<EncryptedToken>
    {
        const { grant_type } = request.body

        let token: Token|undefined

        switch (grant_type) {
            case 'password': {
                const { username, password } = request.body
                const validated = await this.repository.validateUser(username, password)

                if (!validated) throw new HttpException(401, 'Invalid Account.')

                const auth = <User>validated
                auth.grant_type = grant_type
                auth.access_token_expires = DateTime.now().plus({ seconds: ACCESS_TOKEN_EXPIRES! }).toFormat('yyyy-LL-qq TT')
                auth.refresh_token_expires = DateTime.now().plus({ seconds: REFRESH_TOKEN_EXPIRES! }).toFormat('yyyy-LL-qq TT')
                
                token = await this.passport.generatePasswordToken(auth)
                break
            }
            case 'client_credentials': {
                const { client_id, client_secret } = request.body
                const validated = this.repository.validateClientCredentials(client_id, client_secret)

                if (!validated) throw new HttpException(401, 'Invalid Client Credentials.')

                const auth = <User>validated
                auth.grant_type = grant_type
                auth.access_token_expires = DateTime.now().plus({ seconds: ACCESS_TOKEN_EXPIRES! }).toFormat('yyyy-LL-qq TT')
                auth.refresh_token_expires = DateTime.now().plus({ seconds: REFRESH_TOKEN_EXPIRES! }).toFormat('yyyy-LL-qq TT')

                token = await this.passport.generateClientToken(auth)
                break
            }
        }

        return {
            encrypted_token: this.crypt.encrypt(JSON.stringify(token)),
            token: <Token>token
        }
    }

    public async refreshToken (request: Request): Promise<EncryptedToken>
    {
        const auth = <User>request.user

        const { refresh_token_expires, grant_type } = auth
        let token: Token|undefined

        auth.access_token_expires = DateTime.now().plus({ seconds: ACCESS_TOKEN_EXPIRES! }).toFormat('yyyy-LL-qq TT')
        auth.refresh_token_expires = refresh_token_expires

        switch (grant_type) {
            case 'password': {
                token = await this.passport.generatePasswordToken(auth)
                break
            }
            case 'client_credentials': {
                token = await this.passport.generateClientToken(auth)
                break
            }
        }

        return {
            encrypted_token: this.crypt.encrypt(JSON.stringify(token)),
            token: <Token>token
        }
    }
}

export default AuthService