import { atom } from 'recoil'

const defaultErrorMessage = 'Campo obrigatório'

export const loginState = atom({
  key: 'loginState',
  default: {
    isLoading: false,
    email: '',
    password: '',
    emailError: defaultErrorMessage,
    passwordError: defaultErrorMessage,
    mainErrorMessage: '',
    fieldToValidate: '',
    isFormValid: false
  }
})
