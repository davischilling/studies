import { atom } from 'recoil'

const defaultErrorMessage = 'Campo obrigatório'

export const signUpState = atom({
  key: 'signUpState',
  default: {
    isLoading: false,
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    nameError: defaultErrorMessage,
    emailError: defaultErrorMessage,
    passwordError: defaultErrorMessage,
    passwordConfirmationError: defaultErrorMessage,
    mainErrorMessage: '',
    fieldToValidate: '',
    isFormValid: false
  }
})
