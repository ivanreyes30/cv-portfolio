// export const REFRESH_TOKEN_EXPIRES = 2 * (60 * 60)
// export const ACCESS_TOKEN_EXPIRES = 2 * (60 * 60)

export const REFRESH_TOKEN_EXPIRES = 60
export const ACCESS_TOKEN_EXPIRES = 30
export const COOKIE_EXPIRES = REFRESH_TOKEN_EXPIRES * 1000

export const {
    REDIS_HOST,
    REDIS_PASSWORD,
    REDIS_PORT
} = process.env