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

    public async token (request: Request): Promise<Token>
    {
        const {
            grant_type,
            username,
            password
        } = request.body

        // let auth = null

        // switch (grant_type) {
        //     case 'password': {
        //         const validated = await this.repository.validateUser(username, password)

        //         if (!validated) throw new HttpException(401, 'Invalid Account.')

        //         auth = validated
        //         auth.grant_type = grant_type
        //         auth.access_token_expires = DateTime.now().plus({ seconds: ACCESS_TOKEN_EXPIRES! }).toFormat('yyyy-LL-qq TT')
        //         auth.refresh_token_expires = DateTime.now().plus({ seconds: REFRESH_TOKEN_EXPIRES! }).toFormat('yyyy-LL-qq TT')
                
        //         return await this.passport.generatePassportToken(auth)
        //     }
        //     case 'client_credentials': {
        //         //
        //         break
        //     }
        //     case 'refresh_token': {
        //         console.log(request.user)
        //         break
        //     }
        // }

        const validated = await this.repository.validateUser(username, password)

        if (!validated) throw new HttpException(401, 'Invalid Account.')

        const auth: User = <User>validated
        auth.grant_type = grant_type
        auth.access_token_expires = DateTime.now().plus({ seconds: ACCESS_TOKEN_EXPIRES! }).toFormat('yyyy-LL-qq TT')
        auth.refresh_token_expires = DateTime.now().plus({ seconds: REFRESH_TOKEN_EXPIRES! }).toFormat('yyyy-LL-qq TT')
        
        return await this.passport.generatePassportToken(auth)

        // return await this.passport.generatePassportToken(auth)
    }

    public async refreshToken (request: Request): Promise<Token>
    {
        const auth = <User>request.user

        const { refresh_token_expires } = auth

        auth.access_token_expires = DateTime.now().plus({ seconds: ACCESS_TOKEN_EXPIRES! }).toFormat('yyyy-LL-qq TT')
        auth.refresh_token_expires = refresh_token_expires
        
        return await this.passport.generatePassportToken(auth)
    }

}

export default AuthService