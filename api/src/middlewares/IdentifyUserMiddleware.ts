import { Request, Response, NextFunction } from 'express'

const IdentifyUserMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log('IdentifyUserMiddleware')
}

export default IdentifyUserMiddleware