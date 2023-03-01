import { AxiosResponse } from 'axios'

export default interface HttpRequestInterface {
    post(endpoint: string, params: any): Promise<AxiosResponse>
}