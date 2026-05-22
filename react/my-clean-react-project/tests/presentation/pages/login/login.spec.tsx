import { InvalidCredentialsError } from '@/data/errors'
import { ValidationStub } from '@/tests/data/mocks'
import { AuthenticationStub } from '@/tests/domain/mocks'
import { renderWithHistory } from '@/tests/presentation/mocks'
import { Login } from '@/presentation/pages'

import { cleanup, fireEvent, screen, waitFor, act } from '@testing-library/react'
import faker from 'faker'
import { createMemoryHistory } from 'history'
import 'jest-localstorage-mock'

const populateEmailField = (email: string = faker.internet.email()): void => {
  const emailInput = screen.getByTestId('email')
  act(() => {
    fireEvent.input(emailInput, { target: { value: email } })
  })
}

const populatePasswordField = (password: string = faker.internet.password()): void => {
  const passwordInput = screen.getByTestId('password')
  act(() => {
    fireEvent.input(passwordInput, { target: { value: password } })
  })
}

const simulateValidSubmit = (email?: string, password?: string): void => {
  populateEmailField(email)
  populatePasswordField(password)
  const submitButton = screen.getByTestId('submit')
  act(() => {
    fireEvent.click(submitButton)
  })
}

const history = createMemoryHistory({ initialEntries: ['/login'] })

describe('Login Component', () => {
  let validateSpy: jest.SpyInstance
  let authenticationSpy: jest.SpyInstance
  let authentication: AuthenticationStub
  let setCurrentAccountMock: any

  beforeEach(() => {
    const validation = new ValidationStub()
    validateSpy = jest.spyOn(validation, 'validate')
    authentication = new AuthenticationStub()
    authenticationSpy = jest.spyOn(authentication, 'auth')
    act(() => {
      const { setCurrentAccountMock: currentAccountMock } = renderWithHistory({
        history,
        Page: () => Login({ validation, authentication })
      })
      setCurrentAccountMock = currentAccountMock
    })
  })

  afterEach(cleanup)

  test('should start with initial state', () => {
    const emailWrap = screen.getByTestId('email-wrap')
    const email = screen.getByTestId('email')
    const emailLabel = screen.getByTestId('email-label')

    const passwordWrap = screen.getByTestId('password-wrap')
    const password = screen.getByTestId('password')
    const passwordLabel = screen.getByTestId('password-label')

    const submitButton: HTMLButtonElement = screen.getByTestId('submit')
    const errorWrap = screen.getByTestId('error-wrap')

    expect(emailWrap.getAttribute('data-status')).toBe('invalid')
    expect(email.title).toBe('Campo obrigatório')
    expect(emailLabel.title).toBe('Campo obrigatório')

    expect(passwordWrap.getAttribute('data-status')).toBe('invalid')
    expect(password.title).toBe('Campo obrigatório')
    expect(passwordLabel.title).toBe('Campo obrigatório')

    expect(submitButton.disabled).toBe(true)
    expect(errorWrap.childElementCount).toBe(0)
  })

  test('should call Validation with correct email', () => {
    const email = faker.internet.email()
    populateEmailField(email)

    expect(validateSpy).toHaveBeenCalledWith('email', { email })
  })

  test('should call Validation with correct password', () => {
    const password = faker.internet.password()
    populatePasswordField(password)

    expect(validateSpy).toHaveBeenCalledWith('password', { password })
  })

  test('should show email error if Validation fails', () => {
    const validateResponse = {
      value: 'email',
      error: 'Email inválido'
    }
    validateSpy.mockReturnValueOnce(validateResponse)
    populateEmailField()
    const email = screen.getByTestId('email')
    const emailLabel = screen.getByTestId('email-label')

    expect(email.title).toBe(validateResponse.error)
    expect(emailLabel.title).toBe(validateResponse.error)
  })

  test('should show password error if Validation fails', () => {
    const validateResponse = {
      value: 'password',
      error: 'Password inválido'
    }
    validateSpy.mockReturnValueOnce(validateResponse)
    populatePasswordField()
    const password = screen.getByTestId('password')
    const passwordLabel = screen.getByTestId('password-label')

    expect(password.title).toBe(validateResponse.error)
    expect(passwordLabel.title).toBe(validateResponse.error)
  })

  test('should show valid state if Validation succeeds', () => {
    populateEmailField()
    const email = screen.getByTestId('email')
    const emailLabel = screen.getByTestId('email-label')

    populatePasswordField()
    const password = screen.getByTestId('password')
    const passwordLabel = screen.getByTestId('password-label')

    expect(email.title).toBeFalsy()
    expect(emailLabel.title).toBeFalsy()
    expect(password.title).toBeFalsy()
    expect(passwordLabel.title).toBeFalsy()
  })

  test('should disable submit button only if form is invalid', () => {
    populateEmailField()
    populatePasswordField()
    const submitButton: HTMLButtonElement = screen.getByTestId('submit')

    expect(submitButton.disabled).toBe(false)
  })

  test('should show spinner on submit', async () => {
    simulateValidSubmit()

    const spinner = screen.getByTestId('spinner')
    await waitFor(() => spinner)

    expect(spinner).toBeTruthy()
  })

  test('should call Authentication with correct values on submit', async () => {
    const email = faker.internet.email()
    const password = faker.internet.password()

    simulateValidSubmit(email, password)
    const spinner = screen.getByTestId('spinner')
    await waitFor(() => spinner)

    expect(authenticationSpy).toHaveBeenCalledWith({
      email,
      password
    })
  })

  test('should call Authentication only once', async () => {
    simulateValidSubmit()
    simulateValidSubmit()

    const spinner = screen.getByTestId('spinner')
    await waitFor(() => spinner)

    expect(authenticationSpy).toHaveBeenCalledTimes(1)
  })

  test('should not call Authentication if form is invalid', () => {
    const validateResponse = {
      value: 'password',
      error: faker.random.words()
    }
    validateSpy.mockReturnValueOnce(validateResponse)

    populateEmailField()
    act(() => {
      fireEvent.submit(screen.getByTestId('form'))
    })

    expect(authenticationSpy).toHaveBeenCalledTimes(0)
  })

  test('should present error if Authentication fails', async () => {
    const error = new InvalidCredentialsError()

    authenticationSpy.mockResolvedValueOnce(Promise.reject(error))

    simulateValidSubmit()
    const errorWrap = screen.getByTestId('error-wrap')
    await waitFor(() => errorWrap)

    const mainErrorMessage = screen.getByTestId('main-error')

    expect(mainErrorMessage.textContent).toBe(error.message)
    expect(errorWrap.childElementCount).toBe(1)
  })

  test('should call setCurrentAccount on success and navigates to main page', async () => {
    simulateValidSubmit()

    await waitFor(() => screen.getByTestId('form'))

    expect(setCurrentAccountMock).toHaveBeenCalledWith(authentication.account)
    expect(setCurrentAccountMock).toHaveReturnedTimes(1)
    expect(history.length).toBe(1)
    expect(history.location.pathname).toBe('/')
  })
})
