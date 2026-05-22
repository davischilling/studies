import { JoiValidation } from '@/infra/validation/joi'
import { loginValidations } from '@/main/validation'

export const makeLoginValidations = (): JoiValidation => {
  return new JoiValidation(loginValidations)
}
