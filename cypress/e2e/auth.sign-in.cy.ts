import {
  AUTHENTICATION_FAILURE_PATHS,
  AUTHORIZED_USER_INDEX,
} from "../../app/utils/utils.common";
import { t } from "../support/t";

describe("auth.sign-in spec", () => {
  it(`authorize and get redirected from ${AUTHENTICATION_FAILURE_PATHS.user} to ${AUTHORIZED_USER_INDEX}`, () => {
    cy.login();
    cy.visit(AUTHENTICATION_FAILURE_PATHS.user);
    cy.url().should("include", AUTHORIZED_USER_INDEX);
    cy.screenshot(
      `authed user redirected from signin page to authed index page`
    );
  });

  it("validation errors", () => {
    cy.visit(AUTHENTICATION_FAILURE_PATHS.user).wait(50); //hack for nextui

    // invalid email amd too short password
    cy.get('input[name="email"]').should("be.visible").type("invalid-email");
    cy.get('input[name="password"]').should("be.visible").type("12A");
    cy.get('button[data-testid="submit"]').click();
    cy.contains(t("sing.in.error.email.not.valid")).should("be.visible");
    cy.contains(t("sing.in.error.password.too.short")).should("be.visible");
    cy.screenshot("invalid email amd too short password");

    // BROKEN with cypress 3.10.0
    // empty fields
    // cy.get('input[name="email"]').clear();
    // cy.get('input[name="password"]').clear();
    // cy.get('button[data-testid="submit"]').click();
    // cy.contains("Please fill in this field").should("be.visible");
    // cy.screenshot("invalid all empty fields");

    // invalid pass without uppercase
    cy.get('input[name="email"]').clear().type("test@example.com");
    cy.get('input[name="password"]').clear().type("password1");
    cy.get('button[data-testid="submit"]').click();

    cy.contains(t("sing.up.error.password.not.contains.uppercase")).should(
      "be.visible"
    );
    cy.screenshot("invalid pass without uppercase");

    // invalid pass without digit
    cy.get('input[name="email"]').clear().type("test@example.com");
    cy.get('input[name="password"]').clear().type("passwordA");
    cy.get('button[data-testid="submit"]').click();
    cy.contains(t("sing.up.error.password.not.contains.digit")).should(
      "be.visible"
    );
    cy.screenshot("invalid pass without digit");

    // invalid pass too long
    cy.get('input[name="email"]').clear().type("test@example.com");
    cy.get('input[name="password"]')
      .clear()
      .type("passwordA123456789012345678901");
    cy.get('button[data-testid="submit"]').click();
    cy.contains(t("sing.in.error.password.too.long")).should("be.visible");
    cy.screenshot("invalid pass too long");
  });

  it("unconfirmed user sign in", () => {
    cy.visit(AUTHENTICATION_FAILURE_PATHS.user).wait(50); //hack for nextui

    cy.get('input[name="email"]')
      .should("be.visible")
      .type("unconfirmed@domain.test");
    cy.get('input[name="password"]').should("be.visible").type("123321123aA");
    cy.get('button[data-testid="submit"]').click();
    cy.url().should("include", AUTHENTICATION_FAILURE_PATHS.user);
    cy.contains(t("sing.in.error.confirm")).should("be.visible");
    cy.screenshot("error unconfirmed user sign in");
  });
});
