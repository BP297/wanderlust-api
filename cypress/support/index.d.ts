declare namespace Cypress {
  interface Chainable {
    /**
     * 用戶登入
     * @example
     * cy.login('test@example.com', 'password123')
     */
    login(email: string, password: string): Chainable<Element>
  }
} 