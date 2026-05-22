import { HttpClient, HttpStatusCode } from '@/data/contracts'
import { EmailInUseError, UnexpectedError } from '@/data/errors'
import { AddAccount } from '@/domain/usecases'

export class RemoteAddAccount {
  constructor (
    private readonly url: string,
    private readonly httpClient: HttpClient<RemoteAddAccount.Model>
  ) {}

  async add (params: AddAccount.Params): Promise<AddAccount.Model> {
    const httpResponse = await this.httpClient.request({
      url: this.url,
      method: 'post',
      body: params
    })
    switch (httpResponse.statusCode) {
      case HttpStatusCode.ok: return httpResponse.body
      case HttpStatusCode.forbidden: throw new EmailInUseError()
      default: throw new UnexpectedError()
    }
  }
}

export namespace RemoteAddAccount {
  export type Model = AddAccount.Model
}
