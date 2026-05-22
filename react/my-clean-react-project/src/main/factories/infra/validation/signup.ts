import { JoiValidation } from '@/infra/validation/joi'
import { signUpValidations } from '@/main/validation'

export const makesignUpValidations = (): JoiValidation => {
  return new JoiValidation(signUpValidations)
}
