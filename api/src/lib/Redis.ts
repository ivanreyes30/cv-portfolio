import { createClient, RedisClientType } from 'redis'
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from '@/config/cache'
import HttpException from '@/core/HttpException'
import RedisInterface from '@/interfaces/RedisInterface'

class Redis implements RedisInterface
{
    private redis: RedisClientType

    constructor ()
    {
        this.initializeRedis()
    }

    private async initializeRedis (): Promise<void>
    {
        this.redis = createClient({
            url: `redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`
        })

        this.redis.on('error', (error) => { throw new HttpException(500, error) })

        await this.redis.connect()
    }

    public async hset(key: string, field: string, value: string, expires: number): Promise<void>
    {
        try {
            await this.redis.HSET(key, field, value)
            await this.redis.EXPIRE(key, expires)

        } catch (error) {
            throw new HttpException(500, error)
        }
    }

    public async hget(key: string, field: string): Promise<string|undefined>
    {
        try {
            return await this.redis.HGET(key, field)
        } catch (error) {
            throw new HttpException(500, error)
        }
    }
}

export default Redis