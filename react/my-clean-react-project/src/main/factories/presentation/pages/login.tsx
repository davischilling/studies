import { Login } from '@/presentation/pages'
import { makeRemoteAuthentication } from '@/main/factories/data'
import { makeLoginValidations } from '@/main/factories/infra'

import React, { JSXElementConstructor, ReactElement } from 'react'

export const makeLoginPage: React.FC = (): ReactElement<any, string | JSXElementConstructor<any>> =>
  <Login
    validation={makeLoginValidations()}
    authentication={makeRemoteAuthentication()}
  />
