import { makeAxiosHttpClient, makeApiUrl } from '@/main/factories/infra/http'
import { RemoteAddAccount } from '@/data/services'

export const makeRemoteAddAccount = (): RemoteAddAccount =>
  new RemoteAddAccount(makeApiUrl('/signup'), makeAxiosHttpClient())
