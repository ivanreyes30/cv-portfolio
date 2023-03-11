import { User } from '@/interfaces/AuthInterface'
import { Token } from '@/interfaces/AuthInterface'
export default interface PassportInterface {
    initializePassport(): void,
    generatePasswordAccessToken (data: User): string,
    generatePasswordRefreshToken (data: User): Promise<string>,
    generatePasswordToken (auth: User): Promise<Token>,
    verifyPasswordAccessToken (token: string): Promise<User|boolean>,
    verifyPasswordRefreshToken (token: string): Promise<User|boolean>,
    generateClientAccessToken (data: User): string,
    generateClientRefreshToken (data: User): Promise<string>,
    generateClientToken (auth: User): Promise<Token>,
    verifyClientAccessToken (token: string): Promise<User|boolean>,
    verifyClientRefreshToken (token: string): Promise<User|boolean>,
    getLeftTimeTokenExpirationSeconds (datetime: string): number
}