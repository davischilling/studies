import faker from 'faker'
import { testInputStatus, testMainError } from '../utils/form-helpers'
import { mockUnauthorizedError, mockOk } from '../utils/http-mocks'

const baseUrl: string = Cypress.config().baseUrl

describe('Login', () => {
  beforeEach(() => {
    cy.visit('login')
  })

  it('Should load with correct initial state', () => {
    cy.getByTestId('email').should('have.attr', 'readOnly')
    testInputStatus('email', 'Campo obrigatório')

    cy.getByTestId('password').should('have.attr', 'readOnly')
    testInputStatus('password', 'Campo obrigatório')

    cy.getByTestId('submit').should('have.attr', 'disabled')
    cy.getByTestId('error-wrap').should('not.have.descendants')
  })

  it('Should present error state if form is invalid', () => {
    cy.getByTestId('email').focus().type(faker.random.word())
    testInputStatus('email', 'Email inválido')

    cy.getByTestId('password').focus().type(faker.random.alphaNumeric(3))
    testInputStatus('password', 'Password inválido')

    cy.getByTestId('submit').should('have.attr', 'disabled')
    cy.getByTestId('error-wrap').should('not.have.descendants')
  })

  it('Should present valid state if form is valid', () => {
    cy.getByTestId('email').focus().type(faker.internet.email())
    testInputStatus('email', '')

    cy.getByTestId('password').focus().type(faker.random.alphaNumeric(5))
    testInputStatus('password', '')

    cy.getByTestId('submit').should('not.have.attr', 'disabled')
    cy.getByTestId('error-wrap').should('not.have.descendants')
  })

  it('Should present error if invalid credentials are provided', () => {
    mockUnauthorizedError(/login/)
    cy.getByTestId('email').focus().type(faker.internet.email())
    cy.getByTestId('password').focus().type(faker.random.alphaNumeric(5))
    cy.getByTestId('submit').click()
    testMainError('Credenciais inválidas')
    cy.url().should('eq', `${baseUrl}/login`)
  })

  it('Should save accessToken if valid credentials are provided', () => {
    mockOk(/login/, 'POST', '')
    cy.getByTestId('email').focus().type(faker.internet.email())
    cy.getByTestId('password').focus().type(faker.random.alphaNumeric(5)).type('{enter}')
    testMainError()
    cy.url().should('eq', `${baseUrl}/`)
    cy.window().then(window => assert.isOk(window.localStorage.getItem('accessToken')))
  })

  it('Should prevent multiple submits', () => {
    mockOk(/login/, 'POST', '')
    cy.getByTestId('email').focus().type(faker.internet.email())
    cy.getByTestId('password').focus().type(faker.random.alphaNumeric(5))
    cy.getByTestId('submit').dblclick()
    cy.wait('@request').then(() => cy.get('@request.all').should('have.length', 1))
  })

  it('Should not call submit if form is invalid', () => {
    mockOk(/login/, 'POST', '')
    cy.getByTestId('email').focus().type(faker.internet.email()).type('{enter}')
    cy.get('@request.all').should('have.length', 0)
  })
})
