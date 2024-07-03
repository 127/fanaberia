import {
  AUTHENTICATION_FAILURE_PATHS,
  AUTHORIZED_USER_INDEX,
} from '../../app/utils/utils.common';
import { t } from '../support/t';

// WARNING: confirmed-to-recover@domain.test is stubbed email

describe('aut.recover spec', () => {
  it('normal flow with recovery form', () => {
    cy.visit('/auth/recover').wait(50);

    cy.get('input[name="email"]')
      .should('be.visible')
      .type('confirmed-to-recover@domain.test');
    cy.get('button[data-testid="submit"]').click();

    cy.get('input[name="email"]').should('not.exist');
    cy.get('button[data-testid="submit"]').should('not.exist');
    cy.contains(t('recover.inited')).should('be.visible');
    cy.screenshot('normal flow recovery passed');
  });

  it('invalid errors', () => {
    cy.visit('/auth/recover').wait(50);

    // invalid email format — ALWAYS SUCCESS
    // cy.get('input[name="email"]').should("be.visible").type("123321231231312");
    // cy.get('button[data-testid="submit"]').click();
    // cy.contains(t("sing.in.error.email.not.valid")).should("be.visible");
    // cy.screenshot("invalid email format");

    //  BROKEN with cypress 3.10.0
    // empty fields
    // cy.get('input[name="email"]').should("be.visible").click(); //nextui again fails to focus
    // cy.get('button[data-testid="submit"]').click();
    // cy.contains("Please fill in this field").should("be.visible");
    // cy.screenshot("invalid empty field");
  });
});
//  t("recover.reset.impossible")
describe('auth.recover.$token spec', () => {
  it('rejects invalid code', () => {
    cy.visit('/auth/recovered/wrongtoken', { failOnStatusCode: false }).wait(
      50,
    );
    cy.contains(t('recover.reset.impossible')).should('be.visible');
    cy.screenshot('error invalid token');
  });

  it('rejects empty code', () => {
    cy.visit('/auth/recovered', { failOnStatusCode: false }).wait(50);
    cy.contains(t('recover.reset.impossible')).should('be.visible');
    cy.screenshot('error empty token');
  });

  it('validation errors', () => {
    cy.task(
      'query',
      "SELECT * FROM users WHERE email='confirmed-to-recover@domain.test'",
    ).then((user) => {
      cy.visit(`/auth/recovered/${user[0].reset_password_token}`).wait(50);

      // invalid short password not exual password confirmation
      cy.get('input[name="password"]').should('be.visible').type('12A');
      cy.get('input[name="passwordConfirmation"]')
        .should('be.visible')
        .type('12A1');
      cy.get('button[data-testid="submit"]').click();
      cy.contains(t('sing.in.error.password.too.short')).should('be.visible');
      cy.contains(t('sing.in.error.password.confirmation')).should(
        'be.visible',
      );
      cy.screenshot('invalid email too short password not equal passwords');

      // B BROKEN with cypress 3.10.0
      // empty fields
      // cy.get('input[name="password"]').clear();
      // cy.get('input[name="passwordConfirmation"]').clear();
      // cy.screenshot("1");
      // cy.get('button[data-testid="submit"]').click();
      // cy.screenshot("2");
      // cy.contains("Please fill in this field").should("be.visible");
      // cy.screenshot("invalid all empty fields");

      // invalid pass without uppercase
      cy.get('input[name="password"]').clear().type('password1');
      cy.get('input[name="passwordConfirmation"]').clear().type('password1');
      cy.get('button[data-testid="submit"]').click();
      cy.contains(t('sing.up.error.password.not.contains.uppercase')).should(
        'be.visible',
      );
      cy.screenshot('invalid pass without uppercase');

      // invalid pass without digit
      cy.get('input[name="password"]').clear().type('passwordA');
      cy.get('input[name="passwordConfirmation"]').clear().type('passwordA');
      cy.get('button[data-testid="submit"]').click();
      cy.contains(t('sing.up.error.password.not.contains.digit')).should(
        'be.visible',
      );
      cy.screenshot('invalid pass without digit');

      // invalid pass too long
      cy.get('input[name="password"]')
        .clear()
        .type('passwordA123456789012345678901');
      cy.get('input[name="passwordConfirmation"]')
        .clear()
        .type('passwordA123456789012345678901');
      cy.get('button[data-testid="submit"]').click();
      cy.contains(t('sing.in.error.password.too.long')).should('be.visible');
      cy.screenshot('invalid pass too long');
    });
  });

  it('accepts valid code and correct password', () => {
    const pass = 'Password1';
    cy.task('getLastEmail', 'confirmed-to-recover@domain.test').then(
      (email: { [key: string]: string }) => {
        // save email to file
        cy.writeFile(
          './cypress/downloads/letter_user_recovery.html',
          email.html,
        );
        // cy.task("log", email.html as string);
        const token = email.html.match(/\/auth\/recovered\/([\w-]+)/)[1];
        cy.task('log', token);
        cy.visit(`/auth/recovered/${token}`).wait(50);
        // cy.screenshot("recovery form");
        cy.get('input[name="password"]').should('be.visible').type(pass);
        cy.get('input[name="passwordConfirmation"]')
          .should('be.visible')
          .type(pass);
        cy.get('button[data-testid="submit"]').click();

        cy.url().should(
          'include',
          `${AUTHENTICATION_FAILURE_PATHS.user}?recovered=true`,
        );
        cy.contains(t('sign.up.success.recovered')).should('be.visible');
        cy.screenshot('recovery form accomplished');
      },
    );
  });

  it('logins recovered user', () => {
    cy.task(
      'query',
      "SELECT * FROM users WHERE email='confirmed-to-recover@domain.test'",
    ).then((user) => {
      cy.task('log', user[0].email);
      cy.session(
        user[0].email,
        () => {
          cy.visit(AUTHENTICATION_FAILURE_PATHS.user).wait(50); //hack for nextui

          cy.get('input[name=email]').should('be.visible').type(user[0].email);

          cy.get('input[name=password]')
            .should('be.visible')
            .focus()
            .type('Password1');

          cy.get('[data-testid="submit"]').click();
          cy.url().should('include', AUTHORIZED_USER_INDEX);
          cy.screenshot('resetted pass user loged in');
        },
        {
          validate: () => {
            cy.getCookie('_session').should('exist');
          },
        },
      );
    });
  });
});
