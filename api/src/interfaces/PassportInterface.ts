import { User } from '@/interfaces/AuthInterface'
import { Token } from '@/interfaces/AuthInterface'
export default interface PassportInterface {
    initializePassport(): void,
    generatePasswordAccessToken (data: User): string,
    generatePasswordRefreshToken (data: User): Promise<string>,
    generatePasswordToken (auth: User): Promise<Token>,
    verifyPasswordAccessToken (token: string): Promise<User>,
    verifyPasswordRefreshToken (token: string): Promise<User>,
    generateClientAccessToken (data: User): string,
    generateClientRefreshToken (data: User): Promise<string>,
    generateClientToken (auth: User): Promise<Token>,
    verifyClientAccessToken (token: string): Promise<User>,
    verifyClientRefreshToken (token: string): Promise<User>,
    getLeftTimeTokenExpirationSeconds (datetime: string): number
}