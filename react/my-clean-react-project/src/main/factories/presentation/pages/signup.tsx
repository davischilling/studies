import React from 'react'

import { makeRemoteAddAccount } from '@/main/factories/data'
import { makesignUpValidations } from '@/main/factories/infra'
import { SignUp } from '@/presentation/pages'

export const makeSignUpPage: React.FC = () =>
  <SignUp
    validation={makesignUpValidations()}
    addAccount={makeRemoteAddAccount()}
  />
