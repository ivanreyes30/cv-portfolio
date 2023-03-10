import CryptoInterface from '@/interfaces/CryptoInterface'
import { ENCRYPTION_ALGORITHM, SALT_KEY, PASSWORD_KEY } from '@/config'
import {
    scryptSync,
    createCipheriv,
    createDecipheriv
} from 'crypto'

class Crypto implements CryptoInterface
{
    public encrypt (data: string): string
    {
        const key = scryptSync(PASSWORD_KEY!, SALT_KEY!, 24)
        const iv = Buffer.alloc(16, 0)
        const cipher = createCipheriv(ENCRYPTION_ALGORITHM!, key, iv)

        let encrypted = cipher.update(data, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        
        return encrypted
    }

    public decrypt (encrypted: string): string|boolean
    {
        try {
            const key = scryptSync(PASSWORD_KEY!, SALT_KEY!, 24)
            const iv = Buffer.alloc(16, 0)
            const decipher = createDecipheriv(ENCRYPTION_ALGORITHM!, key, iv)

            let decrypted = decipher.update(encrypted, 'hex', 'utf8')
            decrypted += decipher.final('utf8')
            
            return decrypted
        } catch (error) {
            return false
        }
    }
}

export default Crypto