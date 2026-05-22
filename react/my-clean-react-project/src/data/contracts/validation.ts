export type Schema = {
  validate: Validation['validate']
}

export type ValidationResponse = {
  error?: string
  warning?: string
  value: any
}

export interface Validation {
  validate: (field: string, objToValidate: object) => ValidationResponse
}
