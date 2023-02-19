import { Request } from 'express'
import { hash } from 'bcrypt'
import LoginRequest from '@/requests/auth/LoginRequest'

class AuthController 
{

    private loginRequest = new LoginRequest()

    public login (request: Request)
    {
        // this.loginRequest
        hash(request.body.password, 10, (err, hash) => {
            console.log(hash)
        })
    }
}

export default AuthController