import {
  AUTHENTICATION_FAILURE_PATHS,
  AUTHORIZED_USER_INDEX,
} from '../../app/utils/utils.common';

import { t } from './t';

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

Cypress.on('uncaught:exception', (err) => {
  // Cypress and React Hydrating the document don't get along
  // for some unknown reason. Hopefully, we figure out why eventually
  // so we can remove this.
  if (
    /hydrat/i.test(err.message) ||
    /Minified React error #418/.test(err.message) ||
    /Minified React error #423/.test(err.message)
  ) {
    return false;
  }
});

// Cypress.Commands.add("t", (key, lang) => t(key, lang));

Cypress.Commands.add('changeLocale', (locale) => {
  cy.get('li[data-testid="language-switcher"]>button[data-slot="trigger"]')
    .should('be.visible')
    .click();
  cy.get(`li[data-key="${locale}"]`).should('be.visible').click();
});

Cypress.Commands.add('notExistingPage', (locale) => {
  cy.intercept('/123321').as('page');
  cy.visit('/123321', { failOnStatusCode: false });
  cy.wait('@page').its('response.statusCode').should('equal', 404);
  cy.get('h1')
    .should('be.visible')
    .should('contain.text', t('system.error.404', locale));
  cy.get('a[data-testid="link-home-404"]')
    .should('be.visible')
    .should('contain.text', t('system.error.home', locale));
});

Cypress.Commands.add(
  'login',
  (email = 'confirmed@domain.test', password = '123321123aA') => {
    cy.visit(AUTHENTICATION_FAILURE_PATHS.user).wait(50); //hack for nextui
    cy.get('input[name=email]').should('be.visible').type(email);

    cy.get('input[name=password]').should('be.visible').focus().type(password);

    cy.get('[data-testid="submit"]').click();
    cy.url().should('include', AUTHORIZED_USER_INDEX);
    // cy.screenshot("TASK[login]: logged in");

    cy.getCookie('_session').should('exist');
  },
);
