export default interface CryptoInterface {
    encrypt(data: string): string,
    decrypt(data: string): string|boolean
}