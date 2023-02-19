export default interface LoggerInterface {
    initializeLogger(): void,
    errorlogs(message: string): void
}