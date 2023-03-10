import Joi from 'joi'
import HttpException from '@/core/HttpException'
import { Request, Response, NextFunction } from 'express'

const TokenRequest = (request: Request, response: Response, next: NextFunction) => {

    const { grant_type } = request.body

    const rules: any = {
        grant_type: Joi.string().valid('password', 'client_credentials').required()
    }
    
    switch (grant_type) {
        case 'password': {
            rules.username = Joi.string().email().required()
            rules.password = Joi.string()
            break
        }
        case 'client_credentials': {
            rules.client_id = Joi.string().required(),
            rules.client_secret = Joi.string().required()
            break
        }
    }

    const initializeRules = Joi.object(rules)

    const { error } = initializeRules.validate(request.body)

    if (error === undefined) return next()
    
    throw new HttpException(422, error?.details)
    
}

export default TokenRequest