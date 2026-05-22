export type SignUpType = {
  isLoading: boolean
  name: string
  email: string
  password: string
  passwordConfirmation: string
  nameError: string
  emailError: string
  passwordError: string
  passwordConfirmationError: string
  mainErrorMessage: string
  fieldToValidate: string
  isFormValid: boolean
}
