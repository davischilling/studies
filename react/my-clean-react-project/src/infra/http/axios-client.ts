import { HttpRequest, HttpResponse, HttpClient } from '@/data/contracts/http'

import axios, { AxiosResponse } from 'axios'

export class AxiosHttpClient implements HttpClient {
  async request (data: HttpRequest): Promise<HttpResponse> {
    let axiosResponse: AxiosResponse
    const { url, method, body: bodyData, headers } = data
    try {
      axiosResponse = await axios.request({
        url,
        method,
        data: bodyData,
        headers
      })
    } catch (error) {
      axiosResponse = error.response
    }
    return {
      statusCode: axiosResponse.status,
      body: axiosResponse.data
    }
  }
}
