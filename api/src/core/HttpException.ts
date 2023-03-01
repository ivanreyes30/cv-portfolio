import HttpExceptionInterface from '@/interfaces/HttpExceptionInterface'

class HttpException extends Error implements HttpExceptionInterface
{
    public code: number

    public message: any

    constructor (code: number, message: any)
    {
        super(message)
        this.code = code
        this.message = message
    }
}

export default HttpException