import { InputBase } from '@/presentation/components'
import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'

const makeSut = (): void => {
  render(
    <InputBase name="field" state={{}} setState={null} />
  )
}

describe('Input Component', () => {
  test('should begin with readOnly', () => {
    makeSut()
    const input: HTMLInputElement = screen.getByTestId('field')
    expect(input.readOnly).toBe(true)
  })

  test('should remove readOnly on focus', () => {
    makeSut()
    const input: HTMLInputElement = screen.getByTestId('field')
    fireEvent.focus(input)
    expect(input.readOnly).toBe(false)
  })
})
