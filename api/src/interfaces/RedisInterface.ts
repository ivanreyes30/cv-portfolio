export default interface RedisInterface {
    hset(key: string, field: string, value: string, expires: number): Promise<void>,
    hget(key: string, field: string): Promise<string|undefined>
}