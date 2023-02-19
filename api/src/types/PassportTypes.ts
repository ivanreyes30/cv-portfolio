import { JwtFromRequestFunction } from 'passport-jwt'

export type Options = {
    secretOrKey: string,
    passReqToCallback: boolean,
    jwtFromRequest: JwtFromRequestFunction
    // algorithms: string[]
}

export type User = {
    user_id: number,
    name: string,
    role_id: number,
    date_issued_token: string
}

export type Token = {
    access_token: string,
    refresh_token: string,
    expires_in: number
}