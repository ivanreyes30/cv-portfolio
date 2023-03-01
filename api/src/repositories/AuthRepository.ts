import { head } from 'lodash'
import { compare } from 'bcrypt'
import Repository from '@/repositories/Repository'
import User from '@/models/User'

class AuthRepository extends Repository
{
    constructor ()
    {
        super()
        this.model = new User()
    }

    public async validateUser (email_address: string, password: string): Promise<{name: string, email_address: string} | boolean>
    {
        let user = await this.model.findByColumns({ email_address })
        user = head(user)
        
        if (user === undefined) return false

        const validated = await compare(password, user.password)

        if (!validated) return false

        return {
            name: user.name,
            email_address: user.email_address
        }
    }
}

export default AuthRepository