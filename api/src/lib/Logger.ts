import {
    Logger as WinstonLogger,
    format,
    transports,
    createLogger
} from 'winston'
import { DateTime } from 'luxon'
import LoggerInterface from '@/interfaces/LoggerInterface'

class Logger implements LoggerInterface
{
    private loggingDate: string = DateTime.now().toFormat('yyyy-LL-dd')

    private logger: WinstonLogger

    public initializeLogger (): void
    {
        this.logger = createLogger({
            format: format.json(),
            defaultMeta: { service: 'user-service' },
            transports: [
                new transports.File({ filename: `logs/${this.loggingDate}.log`, level: 'error' })
            ]
        })
    }

    public errorlogs (message: string): void
    {
       this.logger.error(message) 
    }
}

export default Logger