import { UNAUTHORIZED_INDEX } from "../../app/utils/utils.common";
import i18n from "../../app/i18n";

describe("404 error spec", () => {
  i18n.supportedLngs.forEach((locale) => {
    it(`not existing ${locale.toUpperCase()} page load`, () => {
      cy.visit(UNAUTHORIZED_INDEX).wait(50);
      cy.changeLocale(locale);
      cy.notExistingPage(locale);
      cy.screenshot(`error-404-${locale}`);
    });
  });
});
