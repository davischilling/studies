import { RemoteLoadSurveyList } from '@/data/services'
import { makeApiUrl } from '@/main/factories/infra/http'
import { makeAuthorizeHttpClientDecorator } from '@/main/factories/main/decorators'

export const makeRemoteLoadSurvey = (): RemoteLoadSurveyList =>
  new RemoteLoadSurveyList(makeApiUrl('/surveys'), makeAuthorizeHttpClientDecorator())
