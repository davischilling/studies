import { makeAxiosHttpClient, makeApiUrl } from '@/main/factories/infra/http'
import { RemoteAuthentication } from '@/data/services/remote-authentication'

export const makeRemoteAuthentication = (): RemoteAuthentication =>
  new RemoteAuthentication(makeApiUrl('/login'), makeAxiosHttpClient())
