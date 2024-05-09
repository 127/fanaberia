declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      clickLocaleLink(label: string): Chainable<Subject>;
      notExistingPage(): Chainable<Subject>;
    }
  }
}

export {};
