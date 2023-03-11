export interface Token {
    access_token: string,
    refresh_token: string|undefined,
    expires_in: number
}

export interface EncryptedToken {
    encrypted_token: string,
    token: Token
}

export type User = {
    user_id: number|string,
    name: string,
    grant_type: string,
    email_address: string,
    access_token_expires: string,
    refresh_token_expires: string
}