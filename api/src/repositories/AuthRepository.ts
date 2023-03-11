import { head } from 'lodash'
import { compare } from 'bcrypt'
import { User as UserInterface } from '@/interfaces/AuthInterface'
import { CLIENT_ID, CLIENT_SECRET } from '@/config'
import { v4 as uuidv4 } from 'uuid'
import Repository from '@/repositories/Repository'
import User from '@/models/User'

class AuthRepository extends Repository<User>
{
    constructor ()
    {
        super()
        this.model = new User()
    }

    public async validateUser (email_address: string, password: string): Promise<UserInterface|boolean>
    {
        let user = await this.model.findByColumns({ email_address })
        user = head(user)
        
        if (user === undefined) return false

        const validated = await compare(password, user.password)

        if (!validated) return false

        return {
            user_id: user.id,
            name: user.name,
            email_address: user.email_address,
            grant_type: '',
            access_token_expires: '',
            refresh_token_expires: ''
        }
    }

    public validateClientCredentials (client_id: string, client_secret: string): UserInterface|boolean
    {
        if (!(CLIENT_ID === client_id && CLIENT_SECRET === client_secret)) return false

        return {
            user_id: uuidv4(),
            name: 'Client Credentials',
            email_address: '',
            grant_type: 'client_credentials',
            access_token_expires: '',
            refresh_token_expires: ''
        }
    }
}

export default AuthRepository