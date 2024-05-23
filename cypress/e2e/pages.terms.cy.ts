/**
 * @description terms page test covers all module pages tests
 */
import { SIGNUP_USER_PATH } from "../../app/utils/utils.common";
import i18n from "../../app/i18n";
import { t } from "../support/t";

describe("terms pages multilang check without authentication", () => {
  i18n.supportedLngs.forEach((locale) => {
    it(`404 page for not existing page in ${locale.toUpperCase()}`, () => {
      // all 404 are the same and in English defined in root.tsx ErrorBoundary
      cy.visit(`/${locale}/pages/not-existing-page`, {
        failOnStatusCode: false,
      });
      cy.get('[data-testid="error-h1-link-to-root"]')
        .should("be.visible")
        .and("have.attr", "href", "/");
      cy.get('[data-testid="error-p-link-to-root"]')
        .should("be.visible")
        .and("have.attr", "href", "/")
        .should("contain.text", t("system.error.home"));
      cy.get("head title").should("have.text", "Oops!");
      cy.screenshot(`404-page-${locale}`);
    });

    it(`must show terms page in ${locale.toUpperCase()}`, () => {
      cy.task(
        "query",
        `SELECT * FROM pages WHERE slug='terms' AND locale='${locale}'`
      ).then((page) => {
        // cy.task("log", page);
        const { title, keywords, description, heading } = page[0];

        cy.visit(SIGNUP_USER_PATH).wait(50);
        cy.changeLocale(locale).wait(200); //recaptcha google component is fucked
        cy.screenshot(`terms-lc-change-to-${locale}`);
        cy.get('label[data-testid="terms"] a').should("be.visible").click();
        cy.location("pathname").should("eq", `/${locale}/pages/terms`);
        cy.get("h1").should("be.visible").contains(heading);
        cy.get("head title").should("have.text", title);
        cy.get('meta[name="keywords"]').should(
          "have.attr",
          "content",
          keywords
        );
        cy.get('meta[name="description"]').should(
          "have.attr",
          "content",
          description
        );
        cy.screenshot(`terms-page-${locale}`);
      });
    });
  });
});
