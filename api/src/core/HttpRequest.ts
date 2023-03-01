import { APP_URL } from '@/config'
import { AxiosResponse } from 'axios'
import axios from 'axios'
import HttpException from '@/core/HttpException'
import HttpInterface from '@/interfaces/HttpRequestInterface'

class HttpRequest implements HttpInterface
{
    public async post (endpoint: string, params: any): Promise<AxiosResponse>
    {
        try {
            const response = await axios.post(`${APP_URL}${endpoint}`, params)

            return response

        } catch (error: any) {
            const { status, message } = error.response.data
            throw new HttpException(status, message)
        }
    }
}

export default HttpRequest