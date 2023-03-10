import { Request, Response, NextFunction } from 'express'
import HttpException from '@/core/HttpException'
import Logger from '@/lib/Logger'

const errorMiddleware = (error: HttpException, request: Request, response: Response, next: NextFunction) => {
    try {
        const logger = new Logger()
        const status: number = error.code || 500
        const message: string = error.message || 'Something went wrong'
    
        logger.errorlogs(`[${request.method}] ${request.path} >> StatusCode:: ${status}, Message:: ${JSON.stringify(message)}`)
        
        response.status(status).json({ status: false, message })
    } catch (error) {
        next(error)
    }
}

export default errorMiddleware