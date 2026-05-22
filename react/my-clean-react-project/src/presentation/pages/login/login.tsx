import { Validation } from '@/data/contracts'
import { Footer, LoginHeader, currentAccountState } from '@/presentation/components'
import { useValidation } from '@/presentation/hooks'
import { Authentication } from '@/domain/usecases'
import { LoginType } from './login-type'
import { loginState, Input, FormStatus, SubmitButton } from './components'

import Styles from './login-styles.scss'
import React, { useEffect } from 'react'
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil'
import { Link, useHistory } from 'react-router-dom'

type Props = {
  validation: Validation
  authentication: Authentication
}

const Login: React.FC<Props> = ({ validation, authentication }: Props) => {
  const resetLoginState = useResetRecoilState(loginState)
  const { setCurrentAccount } = useRecoilValue(currentAccountState)
  const history = useHistory()
  const defaultErrorMessage = 'Campo obrigatório'
  const [state, setState] = useRecoilState<LoginType>(loginState)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    try {
      if (state.isLoading || !state.isFormValid) {
        return
      }
      setState({ ...state, isLoading: true })
      const account = await authentication.auth({
        email: state.email,
        password: state.password
      })
      setCurrentAccount(account)
      resetLoginState()
      history.replace('/')
    } catch (err) {
      setState(old => ({
        ...old,
        isLoading: false,
        mainErrorMessage: err.message
      }))
    }
  }

  useEffect(() => {
    if (state.fieldToValidate !== '') {
      const objToValidate = {
        [state.fieldToValidate]: state[`${state.fieldToValidate}`]
      }
      useValidation(
        state,
        setState,
        objToValidate,
        validation,
        defaultErrorMessage)
    }
  }, [state[state.fieldToValidate]])

  return (
    <div className={Styles.loginWrap}>
      <LoginHeader />
      <form
        data-testid="form"
        onSubmit={handleSubmit}
        className={Styles.form}
        autoComplete="off"
      >
        <h2>Login</h2>
        <Input type="email" name="email" placeholder="Digite seu e-mail" />
        <Input type="password" name="password" placeholder="Digite sua senha" />
        <SubmitButton text="Entrar" />
        <Link data-testid="signup-page" to="/signup" className={Styles.link}>Criar conta</Link>
        <FormStatus />
      </form>
      <Footer />
    </div>
  )
}

export default Login
