export type HttpResponse<T = any> = {
  statusCode: number
  data: T
}

export abstract class Controller {
  abstract perform(httpRequest: any): Promise<HttpResponse>

  async handle(httpRequest: any): Promise<HttpResponse> {
    try {
      return await this.perform(httpRequest)
    } catch (err: any) {
      if (err.message === 'not_found') {
        return {
          statusCode: 404,
          data: err,
        }
      }
      return {
        statusCode: 500,
        data: err,
      }
    }
  }
}
