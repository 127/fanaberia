import { SIGNUP_USER_PATH } from "../../app/utils/utils.common";
import i18n from "../../app/i18n";
describe("terms pages multilang check without authentication", () => {
  i18n.supportedLngs.forEach((locale) => {
    it(`terms page in ${locale.toUpperCase()} load`, () => {
      cy.visit(SIGNUP_USER_PATH).wait(50);
      cy.changeLocale(locale).wait(200); //recaptcha google component is fucked
      cy.screenshot(`terms-lc-change-to-${locale}`);
      cy.get('label[data-testid="terms"] a').should("be.visible").click();
      cy.location("pathname").should("eq", `/${locale}/pages/terms`);
      cy.screenshot(`terms-page-${locale}`);
    });
  });
});
