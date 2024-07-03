import {
  AUTHENTICATION_FAILURE_PATHS,
  UNAUTHORIZED_INDEX,
} from '../../app/utils/utils.common';
describe('auth.sign-out spec', () => {
  it(`should login, logout and redirect to ${AUTHENTICATION_FAILURE_PATHS.user}`, () => {
    // cy.visit("/").wait(1000);
    // cy.screenshot("befofre login");
    cy.login();
    cy.screenshot('user logged in');
    cy.get('div[data-testid="profile-button"]>button[data-slot="trigger"]')
      .should('be.visible')
      .click();
    cy.screenshot('clicked profile dropown');
    cy.get('button[data-testid="desktop-sign-out-button"]')
      .should('be.visible')
      .click();
    cy.url().should('include', UNAUTHORIZED_INDEX);
    cy.screenshot('user logged out and redirected to unauthorized index');
  });
});
