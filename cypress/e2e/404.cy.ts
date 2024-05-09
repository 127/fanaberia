describe("404 error spec", () => {
  it("not existing EN page load", () => {
    cy.notExistingPage();
  });
  it("not existing RU page load", () => {
    cy.notExistingPage();
  });
  it("not existing ES page load", () => {
    cy.notExistingPage();
  });
});
