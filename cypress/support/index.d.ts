declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      changeLocale(locale: string): Chainable<Subject>;
      notExistingPage(locale?: string): Chainable<Subject>;
      // t(key: string, lang?: string): string;
      login(email?: string, password?: string): Chainable<void>;
    }
  }
}

export {};
