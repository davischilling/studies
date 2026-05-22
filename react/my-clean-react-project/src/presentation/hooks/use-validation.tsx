import { Validation } from '@/data/contracts'
import React from 'react'

export const useValidation = (
  state: { fieldToValidate: string, isFormValid: boolean },
  setState: React.Dispatch<React.SetStateAction<{}>>,
  objToValidate: object,
  validation: Validation,
  defaultMessage: string
): void => {
  if (state[state.fieldToValidate] !== '') {
    const { error } = validation.validate(state.fieldToValidate[0], objToValidate)
    if (error) {
      const errorMessage = `${state.fieldToValidate} inválido`
      setState(prevState => ({
        ...prevState,
        [`${state.fieldToValidate}Error`]: errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1),
        isFormValid: false
      }))
    } else {
      setState(prevState => {
        let error: boolean = true
        for (const field in prevState) {
          if (field.includes('Error') && field !== `${state.fieldToValidate}Error` && prevState[field] !== '') {
            error = false
          }
        }
        const prev = ({
          ...prevState,
          [`${state.fieldToValidate}Error`]: '',
          isFormValid: error
        })
        return prev
      })
    }
  } else {
    setState(prevState => ({
      ...prevState,
      [`${state.fieldToValidate}Error`]: defaultMessage,
      isFormValid: false
    }))
  }
}

export default useValidation
