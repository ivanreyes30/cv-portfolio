import { User } from '@/interfaces/AuthInterface'
import { Token } from '@/interfaces/AuthInterface'
export default interface PassportInterface {
    initializePassport(): void,
    generateAccessToken (data: User): string,
    generateRefreshToken (data: User): Promise<string>,
    generatePassportToken (auth: User): Promise<Token>,
    verifyAccessToken (token: string): Promise<User>,
    verifyRefreshToken (token: string): Promise<User>,
    getLeftTimeTokenExpirationSeconds (datetime: string): number
}