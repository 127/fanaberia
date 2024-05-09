// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//         clickLocalelink(label: string): Chainable<Element>,
//         notExistingPage(): Chainable<Element>
//     //   login(email: string, password: string): Chainable<void>
//     //   drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//     //   dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//     //   visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
Cypress.Commands.add("clickLocaleLink", (label) => {
  cy.get("a").contains(label).click();
});
Cypress.Commands.add("notExistingPage", () => {
  cy.intercept("/123321").as("page");
  cy.visit("/123321", { failOnStatusCode: false });
  cy.wait("@page").its("response.statusCode").should("equal", 404);
});
