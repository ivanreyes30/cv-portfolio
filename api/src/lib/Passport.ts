import { sign, verify, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken'
import { Request } from 'express'
import { DateTime } from 'luxon'
import { Token, User } from '@/interfaces/AuthInterface'
import { Strategy as CustomStrategy, VerifiedCallback } from 'passport-custom'
import {
	ACCESS_TOKEN_SECRET,
	REFRESH_TOKEN_SECRET,
	CLIENT_ACCESS_TOKEN_SECRET,
	CLIENT_REFRESH_TOKEN_SECRET
} from '@/config'
import { ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } from '@/config/cache'
import { AUTH_ROUTE } from '@/config/endpoints'
import { AxiosResponse } from 'axios'
import Crypt from '@/lib/Crypt'
import Redis from '@/lib/Redis'
import passport from 'passport'
import HttpRequest from '@/core/HttpRequest'

import PassportInterface from '@/interfaces/PassportInterface'

class Passport implements PassportInterface
{
	private cache = new Redis()

	private crypt = new Crypt()

	private httpRequest = new HttpRequest()

    public initializePassport (): void
    {
		passport.use('refresh_token', new CustomStrategy(async (request: Request, done: VerifiedCallback) => {

			const { refresh_token, grant_type } = request.body
			
			let decoded: { data: User}|undefined

			try {
				switch (grant_type) {
					case 'password': {
						decoded = <{ data: User }>await verify(refresh_token, REFRESH_TOKEN_SECRET!)
						break
					}
					case 'client_credentials': {
						decoded = <{ data: User }>await verify(refresh_token, CLIENT_REFRESH_TOKEN_SECRET!)
						break
					}
				}
				decoded = <{ data: User }>decoded
				const { user_id } = decoded.data
				const cachedRefreshToken = await this.cache.hget(`refresh_token:${user_id}`, `user_id:${user_id}`)

				if (!cachedRefreshToken) return done('Unauthorized.', false)
				request.user = decoded.data
				return done(null, decoded.data)

			} catch (error) {
				if (error instanceof TokenExpiredError) return done('Token Expired.', false)
				if (error instanceof JsonWebTokenError) return done('Invalid Token.', false)
				if (error) return done('Unauthorized.', false)
			}	
		}))

		passport.use('password_grant', new CustomStrategy(async (request: Request, done: VerifiedCallback) => {
			
			const { _token } = request.cookies
			if (!_token) return done('Unauthorized.', false)

			request.headers.authorization = `Bearer ${_token}`
			let decryptedToken: string|boolean|Token = this.crypt.decrypt(_token)
			if (!decryptedToken) return done('Unauthorized.', false)

			decryptedToken = JSON.parse(<string>decryptedToken)
			const { access_token, refresh_token } = <Token>decryptedToken

			try {
				const checkIfTokenRevoked = await this.verifyPasswordRefreshToken(<string>refresh_token)

				if (!checkIfTokenRevoked) return done('Unauthorized.', false)

				const decoded = <{ data: User }>await verify(access_token, ACCESS_TOKEN_SECRET!)

				request.user = decoded.data

				return done(null, decoded.data)
			} catch (error: any) {
				if (error.message === 'invalid signature') return done('Unauthorized.', false)
				
				const newToken = <AxiosResponse>await this.getNewToken(<string>refresh_token, 'password')

				if (!newToken) return done('Unauthorized.', false)

				const { data } = newToken
				const user = await this.verifyPasswordAccessToken(data.access_token)

				request.cookies._new_token = this.crypt.encrypt(JSON.stringify(newToken.data))
				request.user = user
				return done(null, user)
			}
		}))

		passport.use('client_credentials', new CustomStrategy(async (request: Request, done: VerifiedCallback) => {
			const { _token } = request.cookies
			if (!_token) return done('Unauthorized.', false)

			request.headers.authorization = `Bearer ${_token}`
			let decryptedToken: string|boolean|Token = this.crypt.decrypt(_token)
			if (!decryptedToken) return done('Unauthorized.', false)

			decryptedToken = JSON.parse(<string>decryptedToken)
			const { access_token, refresh_token } = <Token>decryptedToken

			try {
				const checkIfTokenRevoked = await this.verifyClientAccessToken(<string>refresh_token)

				if (!checkIfTokenRevoked) return done('Unauthorized.', false)
				
				const decoded = <{ data: User }>await verify(access_token, CLIENT_ACCESS_TOKEN_SECRET!)

				request.user = decoded.data

				return done(null, decoded.data)
			} catch (error: any) {
				if (error.message === 'invalid signature') return done('Unauthorized.', false)

				const newToken = <AxiosResponse>await this.getNewToken(<string>refresh_token, 'client_credentials')

				if (!newToken) return done('Unauthorized.', false)

				const { data } = newToken
				const user = await this.verifyClientAccessToken(data.access_token)

				request.cookies._new_token = this.crypt.encrypt(JSON.stringify(newToken.data))
				request.user = user
				return done(null, user)
			}
		}))
    }

	/**
	 * Password Grant Functions
	 * 
	 */

    public generatePasswordAccessToken (data: User): string
    {
		const { user_id } = data

		const accessToken = sign({
			data
		}, ACCESS_TOKEN_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRES })

		this.cache.hset(`access_token:${user_id}`, `user_id:${user_id}`, accessToken, ACCESS_TOKEN_EXPIRES)

		return accessToken
    }

	public async generatePasswordRefreshToken (data: User): Promise<string>
    {
		const { user_id } = data

		let refreshToken = await this.cache.hget(`refresh_token:${user_id}`, `user_id:${user_id}`)

		if (!refreshToken) {
			refreshToken = sign({
				data
			}, REFRESH_TOKEN_SECRET!, { expiresIn: REFRESH_TOKEN_EXPIRES })
			this.cache.hset(`refresh_token:${user_id}`, `user_id:${user_id}`, refreshToken, REFRESH_TOKEN_EXPIRES)
		} else {
			const { refresh_token_expires } = <User>await this.verifyPasswordRefreshToken(refreshToken)
			const leftRefreshTokenExpiration = this.getLeftTimeTokenExpirationSeconds(refresh_token_expires)
			this.cache.hset(`refresh_token:${user_id}`, `user_id:${user_id}`, refreshToken, leftRefreshTokenExpiration)
		}

		return refreshToken
    }

	public async generatePasswordToken (auth: User): Promise<Token>
	{
		const token = {
			access_token: this.generatePasswordAccessToken(auth),
			refresh_token: await this.generatePasswordRefreshToken(auth),
			expires_in: REFRESH_TOKEN_EXPIRES
		}

		return token
	}

	public async verifyPasswordAccessToken (token: string): Promise<User|boolean>
	{
		try {
			const decoded = <{ data: User }>await verify(token, ACCESS_TOKEN_SECRET!)
			return decoded.data
		} catch (error) {
			return false
		}
	}

	public async verifyPasswordRefreshToken (token: string): Promise<User|boolean>
	{
		try {
			const decoded = <{ data: User }>await verify(token, REFRESH_TOKEN_SECRET!)
			
			const { user_id } = decoded.data

			const cachedRefreshToken = await this.cache.hget(`refresh_token:${user_id}`, `user_id:${user_id}`)

			if (!cachedRefreshToken) return false

			return decoded.data

		} catch (error) {
			return false
		}
	}

	private async getNewToken (token: string, type: string): Promise<AxiosResponse|boolean>
	{
		try {
			const { baseUrl, refreshToken } = AUTH_ROUTE
			const payload = { refresh_token: token, grant_type: type }

			return await this.httpRequest.post(`${baseUrl}${refreshToken}`, payload)
		} catch (error) {
			return false
		}
	}

	/**
	 * Client Credentials Grant Functions
	 * 
	 */

	public generateClientAccessToken (data: User): string
    {
		const { user_id } = data

		const accessToken = sign({
			data
		}, CLIENT_ACCESS_TOKEN_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRES })

		this.cache.hset(`access_token:${user_id}`, `user_id:${user_id}`, accessToken, ACCESS_TOKEN_EXPIRES)

		return accessToken
    }

	public async generateClientRefreshToken (data: User): Promise<string>
    {
		const { user_id } = data

		let refreshToken = await this.cache.hget(`refresh_token:${user_id}`, `user_id:${user_id}`)

		if (!refreshToken) {
			refreshToken = sign({
				data
			}, CLIENT_REFRESH_TOKEN_SECRET!, { expiresIn: REFRESH_TOKEN_EXPIRES })
			this.cache.hset(`refresh_token:${user_id}`, `user_id:${user_id}`, refreshToken, REFRESH_TOKEN_EXPIRES)
		} else {
			const { refresh_token_expires } = <User>await this.verifyClientRefreshToken(refreshToken)
			const leftRefreshTokenExpiration = this.getLeftTimeTokenExpirationSeconds(refresh_token_expires)
			this.cache.hset(`refresh_token:${user_id}`, `user_id:${user_id}`, refreshToken, leftRefreshTokenExpiration)
		}

		return refreshToken
    }

	public async generateClientToken (auth: User): Promise<Token>
	{
		const token = {
			access_token: this.generateClientAccessToken(auth),
			refresh_token: await this.generateClientRefreshToken(auth),
			expires_in: REFRESH_TOKEN_EXPIRES
		}

		return token
	}

	public async verifyClientAccessToken (token: string): Promise<User|boolean>
	{
		try {
			const decoded = <{ data: User }>await verify(token, CLIENT_ACCESS_TOKEN_SECRET!)
			return decoded.data
		} catch (error) {
			return false
		}
	}

	public async verifyClientRefreshToken (token: string): Promise<User|boolean>
	{
		try {
			const decoded = <{ data: User }>await verify(token, CLIENT_REFRESH_TOKEN_SECRET!)
			
			const { user_id } = decoded.data
			
			const cachedRefreshToken = await this.cache.hget(`refresh_token:${user_id}`, `user_id:${user_id}`)
		
			if (!cachedRefreshToken) return false

			return decoded.data

		} catch (error) {
			return false
		}
	}

	public getLeftTimeTokenExpirationSeconds (datetime: string): number
	{
		const dateTimeNow = DateTime.now().toFormat('yyyy-LL-qq TT')
		const start = DateTime.fromJSDate(new Date(dateTimeNow))
		const end = DateTime.fromJSDate(new Date(datetime))
		const leftRefreshTokenExpiration = end.diff(start).as('seconds')

		return leftRefreshTokenExpiration
	}
}

export default Passport