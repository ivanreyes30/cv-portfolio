import { Request, Response, NextFunction } from 'express'

const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.headers.authorization === 'Bearer ivan.reyes')
    if (req.headers.authorization === 'Bearer ivan.reyes') return next()

    return res.status(401).json({status: false, message: 'Fuck you.'})
}

export default AuthMiddleware