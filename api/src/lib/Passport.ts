import { sign, verify, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken'
import { Request } from 'express'
import { DateTime } from 'luxon'
import { Token, User } from '@/interfaces/AuthInterface'
import { Strategy as CustomStrategy, VerifiedCallback } from 'passport-custom'
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '@/config'
import { ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } from '@/config/cache'
import { AUTH_ROUTE } from '@/config/endpoints'
import { AxiosResponse } from 'axios'
import Crypt from '@/lib/Crypt'
import Redis from '@/lib/Redis'
import passport from 'passport'
import HttpRequest from '@/core/HttpRequest'
import HttpException from '@/core/HttpException'

import PassportInterface from '@/interfaces/PassportInterface'

class Passport implements PassportInterface
{
	private cache = new Redis()

	private crypt = new Crypt()

	private httpRequest = new HttpRequest()

    public initializePassport (): void
    {
		passport.use('refresh_token', new CustomStrategy(async (request: Request, done: VerifiedCallback) => {

			const { refresh_token } = request.body

			// verify(refresh_token, REFRESH_TOKEN_SECRET!, async (error: any, decoded: any) => {

				// if (error instanceof TokenExpiredError) return done('Token Expired.', false)
				// if (error instanceof JsonWebTokenError) return done('Invalid Token.', false)
				// if (error) return done('Unauthorized.', false)

			// 	const { user_id } = decoded.data
			// 	const cachedRefreshToken = await this.cache.hget(`refresh_token:${user_id}`, `user_id:${user_id}`)

			// 	if (!cachedRefreshToken) return done('Unauthorized.', false)

			// 	request.user = decoded.data
			// 	return done(null, decoded.data)
				
			// })
			try {
				const decoded = <{ data: User }>await verify(refresh_token, REFRESH_TOKEN_SECRET!)
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

			// let decryptedToken: string|boolean|Token = this.crypt.decrypt(_token)
			// if (!decryptedToken) return done('Unauthorized.', false)

			// decryptedToken = JSON.parse(<string>decryptedToken)
			// const { access_token, refresh_token } = <Token>decryptedToken

			// verify(access_token, ACCESS_TOKEN_SECRET!, async (error: any, decoded: any) => {

			// 	if (error) {
			// 		const newToken = <AxiosResponse>await this.getNewToken(<string>refresh_token)

			// 		if (!newToken) return done('Unauthorized.', false)

			// 		const { data } = newToken

			// 		const user = await this.verifyAccessToken(data.access_token)

			// 		request.cookies._new_token = this.crypt.encrypt(JSON.stringify(newToken.data))
			// 		request.user = user
			// 		return done(null, user)
			// 	}

			// 	request.user = decoded.data
			// 	return done(null, decoded.data)

			// })

			let decryptedToken: string|boolean|Token = this.crypt.decrypt(_token)
			if (!decryptedToken) return done('Unauthorized.', false)

			decryptedToken = JSON.parse(<string>decryptedToken)
			const { access_token, refresh_token } = <Token>decryptedToken

			try {
				const decoded = <{ data: User }>verify(access_token, ACCESS_TOKEN_SECRET!)

				request.user = decoded.data

				return done(null, decoded.data)
			} catch (error) {
				const newToken = <AxiosResponse>await this.getNewToken(<string>refresh_token)

				if (!newToken) return done('Unauthorized.', false)

				const { data } = newToken
				const user = await this.verifyAccessToken(data.access_token)

				request.cookies._new_token = this.crypt.encrypt(JSON.stringify(newToken.data))
				request.user = user
				return done(null, user)
			}
		}))
    }

    public generateAccessToken (data: User): string
    {
		const { user_id } = data

		const accessToken = sign({
			data
		}, ACCESS_TOKEN_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRES })

		this.cache.hset(`access_token:${user_id}`, `user_id:${user_id}`, accessToken, ACCESS_TOKEN_EXPIRES)

		return accessToken
    }

	public async generateRefreshToken (data: User): Promise<string>
    {
		const { user_id } = data

		let refreshToken = await this.cache.hget(`refresh_token:${user_id}`, `user_id:${user_id}`)

		if (!refreshToken) {
			refreshToken = sign({
				data
			}, REFRESH_TOKEN_SECRET!, { expiresIn: REFRESH_TOKEN_EXPIRES })
			this.cache.hset(`refresh_token:${user_id}`, `user_id:${user_id}`, refreshToken, REFRESH_TOKEN_EXPIRES)
		} else {
			const { refresh_token_expires } = await this.verifyRefreshToken(refreshToken)
			const leftRefreshTokenExpiration = this.getLeftTimeTokenExpirationSeconds(refresh_token_expires)
			this.cache.hset(`refresh_token:${user_id}`, `user_id:${user_id}`, refreshToken, leftRefreshTokenExpiration)
		}

		return refreshToken
    }

	public async generatePassportToken (auth: User): Promise<Token>
	{
		const token = {
			access_token: this.generateAccessToken(auth),
			refresh_token: await this.generateRefreshToken(auth),
			expires_in: REFRESH_TOKEN_EXPIRES
		}

		return token
	}

	public async verifyAccessToken (token: string): Promise<User>
	{
		try {
			const decoded = <{ data: User }>await verify(token, ACCESS_TOKEN_SECRET!)
			return decoded.data
		} catch (error) {
			throw new HttpException(401, 'Unauthorized.')
		}
	}

	public async verifyRefreshToken (token: string): Promise<User>
	{
		try {
			const decoded = <{ data: User }>await verify(token, REFRESH_TOKEN_SECRET!)
			return decoded.data
		} catch (error) {
			throw new HttpException(401, 'Unauthorized.')
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

	private async getNewToken (token: string): Promise<AxiosResponse|boolean>
	{
		try {
			const { baseUrl, refreshToken } = AUTH_ROUTE
			const payload = { refresh_token: token }

			return await this.httpRequest.post(`${baseUrl}${refreshToken}`, payload)
		} catch (error) {
			return false
		}
	}
}

export default Passport