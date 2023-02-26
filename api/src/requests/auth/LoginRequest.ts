import Joi from 'joi'
import HttpException from '@/core/HttpException'
import { Request, Response, NextFunction } from 'express'

const LoginRequest = (request: Request, response: Response, next: NextFunction) => {
    const rules = Joi.object({
        email_address: Joi.string().email().required(),
        password: Joi.string()
    })

    const { error } = rules.validate(request.body)

    if (error === undefined) return next()
    
    throw new HttpException(false, error?.details, 422)
}

export default LoginRequest