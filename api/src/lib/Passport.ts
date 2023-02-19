import passport from 'passport'
import Crypt from '@/lib/Crypt'
import { sign } from 'jsonwebtoken'
import { Request } from 'express'
// import { DateTime } from 'luxon'
import { Options, User, Token } from '@/types/PassportTypes'
import { Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt'
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '@/config'
import { ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } from '@/config/cache'

import PassportInterface from '@/interfaces/PassportInterface'

class Passport implements PassportInterface
{
	private token: Token

	private crypt = new Crypt()

    private options: Options = {
		secretOrKey: '',
		passReqToCallback: true,
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }

    constructor ()
    {
		//
    }

    public initializePassport (): void
    {
		[ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET].forEach((value) => {
			this.options.secretOrKey = value!
			passport.use(new Strategy(this.options, (request: Request, jwt_payload: any, done: VerifiedCallback) => {
				return done(null, false)
			}))
		})
		this.generateToken()
    }

    public generateAccessToken (data: User): string
    {
		const accessToken = sign({
			exp: ACCESS_TOKEN_EXPIRES,
			data
		}, ACCESS_TOKEN_SECRET!)
		// const encryptedToken = this.crypt.encrypt(accessToken)
		// console.log(this.crypt.decrypt('28e37a08ac07e9e3f43fc5368712243470951c0ee305d0ca99d1d035660424693db86d50b4c388eeeda21b4783e1d9088de87610362b59880d25f75a1830a73dd49dad8a77437f6415814fc0b9213a757c9148d674dfebe64bfc7838899c7f42c60b39aa00415cb6d1eb0c710fde619295b6c4afb8d1bf5a36ef4e86aa4c4acbf253ea4c68ef7db3f7c1f93230d61ca659afd78bee81d3f8303beae1355d751300abe8a48fa6ff551e32d8f18c78dba7'))
		return accessToken
    }

	public generateRefreshToken (data: User): string
    {
		const refreshToken = sign({
			exp: REFRESH_TOKEN_EXPIRES,
			data
		}, REFRESH_TOKEN_SECRET!)
		
		return refreshToken
    }

	public generateToken (): string
	{
		const user = {
			name: 'Ivan',
			user_id: 1,
			role_id: 1,
			date_issued_token: '2022-02-19 13:28:00'
		}
		
		this.token = {
			access_token: this.generateAccessToken(user),
			refresh_token: this.generateRefreshToken(user),
			expires_in: ACCESS_TOKEN_EXPIRES
		}

		return JSON.stringify(this.token)
	}
}

export default Passport