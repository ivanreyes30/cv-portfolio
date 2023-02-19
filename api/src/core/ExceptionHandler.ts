import Logger from '@/lib/Logger'
import ExceptionHandlerInterface from '@/interfaces/ExceptionHandlerInterface'

class ExceptionHandler implements ExceptionHandlerInterface
{
    private logger = new Logger()

    public status: boolean

    public message: string

    public code: number

    constructor (status: boolean, message: string, code: number)
    {
        this.status = status
        this.message = message
        this.code = code

        this.logger.errorlogs(message)
    }
}

export default ExceptionHandler