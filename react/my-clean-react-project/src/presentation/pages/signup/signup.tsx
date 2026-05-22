import { Validation } from '@/data/contracts'
import { AddAccount } from '@/domain/usecases'
import { Footer, LoginHeader, currentAccountState } from '@/presentation/components'
import { useValidation } from '@/presentation/hooks'
import { signUpState, Input, FormStatus, SubmitButton } from './components'

import React, { useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil'
import Styles from './signup-styles.scss'
import { SignUpType } from './signup-type'

type Props = {
  validation: Validation
  addAccount: AddAccount
}

const SignUp: React.FC<Props> = ({ validation, addAccount }: Props) => {
  const resetSignUpState = useResetRecoilState(signUpState)
  const { setCurrentAccount } = useRecoilValue(currentAccountState)
  const history = useHistory()
  const defaultErrorMessage = 'Campo obrigatório'
  const [state, setState] = useRecoilState<SignUpType>(signUpState)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    try {
      if (state.isLoading || !state.isFormValid) {
        return
      }
      setState({ ...state, isLoading: true })
      const account = await addAccount.add({
        name: state.name,
        email: state.email,
        password: state.password,
        passwordConfirmation: state.passwordConfirmation
      })
      setCurrentAccount(account)
      resetSignUpState()
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
      let objToValidate: object
      if (state.fieldToValidate[0] === 'passwordConfirmation') {
        objToValidate = {
          password: state.password,
          passwordConfirmation: state.passwordConfirmation
        }
      } else {
        objToValidate = {
          [state.fieldToValidate]: state[`${state.fieldToValidate}`]
        }
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
    <div className={Styles.signupWrap}>
      <LoginHeader />
      <form
        data-testid="form"
        onSubmit={handleSubmit}
        className={Styles.form}
        autoComplete="off"
      >
        <h2>Criar Conta</h2>
        <Input type="text" name="name" placeholder="Digite seu nome" />
        <Input type="email" name="email" placeholder="Digite seu e-mail" />
        <Input type="password" name="password" placeholder="Digite sua senha" />
        <Input type="password" name="passwordConfirmation" placeholder="Confirme sua senha" />
        <SubmitButton text="Cadastrar" />
        <Link data-testid="signup-page" to="/login" className={Styles.link}>Login</Link>
        <FormStatus />
      </form>
      <Footer />
    </div>
  )
}

export default SignUp
