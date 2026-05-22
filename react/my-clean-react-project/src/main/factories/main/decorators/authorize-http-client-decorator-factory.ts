import { AuthorizeHttpClientDecorator } from '@/main/decorators'
import { makeLocalStorageAdapter } from '@/main/factories/infra/cache'
import { makeAxiosHttpClient } from '@/main/factories/infra/http'
import { HttpClient } from '@/data/contracts/http'

export const makeAuthorizeHttpClientDecorator = (): HttpClient =>
  new AuthorizeHttpClientDecorator(makeLocalStorageAdapter(), makeAxiosHttpClient())
