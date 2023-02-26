import ExceptionHandlerInterface from '@/interfaces/ExceptionHandlerInterface'

class HttpException extends Error implements ExceptionHandlerInterface
{
    public status: boolean

    public message: any

    public code: number

    constructor (status: boolean, message: any, code: number)
    {
        super(message)
        this.status = status
        this.message = message
        this.code = code
    }
}

export default HttpException