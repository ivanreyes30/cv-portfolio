import { User, Token } from '@/types/PassportTypes'
export default interface PassportInterface {
    initializePassport(): void,
    generateAccessToken (data: User): string,
    generateRefreshToken (data: User): string,
    generateToken (auth: any): Token
}