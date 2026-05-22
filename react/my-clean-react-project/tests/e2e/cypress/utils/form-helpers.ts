export const testInputStatus = (field: string, error?: string): void => {
  cy.getByTestId(`${field}-wrap`).should('have.attr', 'data-status', error ? 'invalid' : 'valid')
  cy.getByTestId(field).should('have.attr', 'title', error)
  cy.getByTestId(`${field}-label`).should('have.attr', 'title', error)
}

export const testMainError = (error?: string): void => {
  cy.getByTestId('spinner').should('not.exist')
  cy.getByTestId('main-error').should(`${error ? 'contain.text' : 'not.exist'}`, error)
}
