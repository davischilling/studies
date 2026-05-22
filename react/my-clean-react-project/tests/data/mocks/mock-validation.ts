import { Validation, ValidationResponse } from '@/data/contracts'
import { mockValidationResponse } from '@/tests/infra/mocks'

export class ValidationStub implements Validation {
  errorMessage: string

  validate (field: string, objToValidate: object): ValidationResponse {
    return mockValidationResponse()
  }
}
