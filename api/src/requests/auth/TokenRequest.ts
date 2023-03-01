import Joi from 'joi'
import HttpException from '@/core/HttpException'
import { Request, Response, NextFunction } from 'express'

const TokenRequest = (request: Request, response: Response, next: NextFunction) => {
    const rules = Joi.object({
        grant_type: Joi.string().valid('password', 'client_credentials').required(),
        username: Joi.string().email().required(),
        password: Joi.string()
    })

    const { error } = rules.validate(request.body)

    if (error === undefined) return next()
    
    throw new HttpException(422, error?.details)
}

export default TokenRequest