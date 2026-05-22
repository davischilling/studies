import { SchemaField } from '@/infra/validation/joi'

import Joi from 'joi'

const passwordPattern = /^[a-zA-Z0-9]{5,30}$/

export const signUpValidations: SchemaField[] = [
  {
    field: 'name',
    schema: Joi.object({
      name: Joi.string()
        .required()
    })
  },
  {
    field: 'email',
    schema: Joi.object({
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
    })
  },
  {
    field: 'password',
    schema: Joi.object({
      password: Joi.string()
        .pattern(new RegExp(passwordPattern)).required()
    })
      .xor('password')
  },
  {
    field: 'passwordConfirmation',
    schema: Joi.object({
      password: Joi.string(),
      passwordConfirmation: Joi.string()
        .required().valid(Joi.ref('password'))
    })
  }
]
