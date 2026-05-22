import { Validation, ValidationResponse } from '@/data/contracts/validation'

import { Schema, ValidationResult } from 'joi'

export type SchemaField = {
  field: string
  schema: Schema
}

export class JoiValidation implements Validation {
  constructor (
    private readonly schema: SchemaField[]
  ) {}

  validate (field: string, objToValidate: object): ValidationResponse {
    const fieldToValidate = this.schema.find(element => element.field === field)
    const { value, error, warning }: ValidationResult = fieldToValidate.schema.validate(objToValidate)
    return {
      value,
      error: error !== undefined ? error.message : '',
      warning: warning !== undefined ? warning.message : ''
    }
  }
}
