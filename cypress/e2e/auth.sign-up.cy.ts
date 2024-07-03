import {
  AUTHENTICATION_FAILURE_PATHS,
  AUTHORIZED_USER_INDEX,
  SIGNUP_USER_PATH,
} from '../../app/utils/utils.common';
import { t } from '../support/t';

// WARNING: confirmed@domain.test and unconfirmed@domain.test ared stubbed emails

describe('auth.sign-up spec', () => {
  it('normal flow with sign-up form', () => {
    const email = `new_user+${Date.now().toString()}@domain.test`;
    const pass = '123321123aA';
    cy.visit(SIGNUP_USER_PATH).wait(50); //hack for nextui

    cy.get('input[name="email"]').should('be.visible').type(email);
    cy.get('input[name="password"]').should('be.visible').type(pass);
    cy.get('input[name="passwordConfirmation"]')
      .should('be.visible')
      .type(pass);

    // impossible not to check terms as far is required
    cy.get('label[data-testid="terms"]').should('be.visible').click(10, 10);

    cy.get('button[data-testid="submit"]').click();
    cy.url().should(
      'include',
      `${AUTHENTICATION_FAILURE_PATHS.user}?registered=true`,
    );
    cy.contains(t('sign.up.success')).should('be.visible');
    cy.screenshot('normal flow sign up passed');
  });

  it(`authorized redirected from ${SIGNUP_USER_PATH} to ${AUTHORIZED_USER_INDEX}`, () => {
    cy.login();
    cy.visit(SIGNUP_USER_PATH);
    cy.url().should('include', AUTHORIZED_USER_INDEX);
    cy.screenshot(
      `authed user redirected from signup page to authed index page`,
    );
  });

  it('validation errors', () => {
    cy.visit(SIGNUP_USER_PATH).wait(50); //hack for nextui

    // invalid email amd too short password not exual password confirmation
    cy.get('input[name="email"]').should('be.visible').type('invalid-email');
    cy.get('input[name="password"]').should('be.visible').type('12A');
    cy.get('input[name="passwordConfirmation"]')
      .should('be.visible')
      .type('12A1');
    // impossible not to check terms as far is required
    cy.get('label[data-testid="terms"]').should('be.visible').click(10, 10);

    cy.get('button[data-testid="submit"]').click();
    cy.contains(t('sing.in.error.email.not.valid')).should('be.visible');
    cy.contains(t('sing.in.error.password.too.short')).should('be.visible');
    cy.contains(t('sing.in.error.password.confirmation')).should('be.visible');
    cy.screenshot('invalid email too short password not equal passwords');
    // impossible not to check as terms far is required
    // cy.contains(t("sing.up.error.terms")).should("be.visible");

    // BROKEN with cypress 3.10.0
    // empty fields
    // cy.get('input[name="email"]').clear();
    // cy.get('input[name="password"]').clear();
    // cy.get('input[name="passwordConfirmation"]').clear();
    // cy.get('button[data-testid="submit"]').click();
    // // should be clicked
    // // cy.get('label[data-testid="terms"]').should("be.visible").click(10, 10);
    // cy.contains("Please fill in this field").should("be.visible");
    // cy.screenshot("invalid all empty fields");

    // invalid pass without uppercase
    cy.get('input[name="email"]').clear().type('test@example.com');
    cy.get('input[name="password"]').clear().type('password1');
    cy.get('input[name="passwordConfirmation"]').clear().type('password1');
    cy.get('button[data-testid="submit"]').click();
    cy.contains(t('sing.up.error.password.not.contains.uppercase')).should(
      'be.visible',
    );
    cy.screenshot('invalid pass without uppercase');

    // invalid pass without digit
    cy.get('input[name="email"]').clear().type('test@example.com');
    cy.get('input[name="password"]').clear().type('passwordA');
    cy.get('input[name="passwordConfirmation"]').clear().type('passwordA');
    cy.get('button[data-testid="submit"]').click();
    cy.contains(t('sing.up.error.password.not.contains.digit')).should(
      'be.visible',
    );
    cy.screenshot('invalid pass without digit');

    // invalid pass too long
    cy.get('input[name="email"]').clear().type('test@example.com');
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

describe('auth.confirm.$token spec', () => {
  it('rejects invalid confirmation token', () => {
    cy.visit('/auth/confirm/wrongtoken').wait(50);
    cy.contains(t('sing.in.error.token')).should('be.visible');
    cy.screenshot('error invalid token');
  });

  it('rejects empty confirmation token', () => {
    cy.visit('/auth/confirm').wait(50);
    cy.contains(t('sing.in.error.token')).should('be.visible');
    cy.screenshot('error empty token');
  });

  it('accepts valid code', () => {
    //get last unconfirmed user
    cy.task(
      'query',
      'SELECT * FROM users WHERE id>3 AND confirmed_at IS NULL ORDER by id DESC LIMIT 1',
    ).then((user) => {
      cy.task('log', user[0].email);
      cy.task('getLastEmail', user[0].email).then(
        (email: { [key: string]: string }) => {
          // save email to file
          cy.writeFile(
            './cypress/downloads/letter_user_confirmation.html',
            email.html,
          );
          // cy.task("log", email.html as string);
          const token = email.html.match(/\/auth\/confirm\/([\w-]+)/)[1];
          cy.task('log', token);
          cy.visit(`/auth/confirm/${token}`).wait(50);
          cy.contains(t('sign.up.success.confirmed')).should('be.visible');
          cy.screenshot('confirmation link clicked');
        },
      );
    });
  });

  it('logins  confirmed user', () => {
    const password = '123321123aA';
    //get last confirmed user
    cy.task(
      'query',
      'SELECT * FROM users WHERE id>3 AND confirmed_at IS NOT NULL ORDER by id DESC LIMIT 1',
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
            .type(password);

          cy.get('[data-testid="submit"]').click();
          cy.url().should('include', AUTHORIZED_USER_INDEX);
          cy.screenshot('confirmed user first loged in');
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
