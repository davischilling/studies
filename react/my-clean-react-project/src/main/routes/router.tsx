import React from 'react'
import {
  BrowserRouter,
  Switch,
  Route
} from 'react-router-dom'
import { makeLoginPage, makeSignUpPage, makeSurveyListPage } from '@/main/factories/presentation'
import { getCurrentAccountAdapter, setCurrentAccountAdapter } from '@/main/adapters'
import { PrivateRoute } from '@/main/proxies'
import { currentAccountState } from '@/presentation/components'

import { RecoilRoot } from 'recoil'

const Router: React.FC = () => {
  const state = {
    setCurrentAccount: setCurrentAccountAdapter,
    getCurrentAccount: getCurrentAccountAdapter
  }
  return (
    <RecoilRoot initializeState={({ set }) => set(currentAccountState, state)}>
      <BrowserRouter>
        <Switch>
          <Route path="/login" exact component={makeLoginPage} />
          <Route path="/signup" exact component={makeSignUpPage} />
          <PrivateRoute path="/" exact component={makeSurveyListPage} />
        </Switch>
      </BrowserRouter>
    </RecoilRoot>

  )
}

export default Router
