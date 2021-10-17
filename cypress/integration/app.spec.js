describe("Can go back to home page from sorry message", () => {
  it("should navigate back to home page from sorry page", () => {
    // Start from the index page
    cy.visit("/crossword");

    // Input invalid URL into text box
    cy.contains("Try Again").click()

    // The new url should include "/crossword"
    cy.url().should("include", "/");

    // The new page should contain an h1 with "Sorry"
    cy.get("h1").contains("Cryptic Crossword");
  });
});

// TODO test with mocked api request
describe("Fetching crossword fails should bring up sorry message", () => {

  before(() => {
    // runs once before all tests in the block
      cy.visit("/");
    
      // Input invalid URL into text box
      cy.get("input").type("invalid-url{enter}");
    
      // The new url should include "/crossword"
      cy.url().should("include", "/crossword");

      // Mock return value to initiate error handling response from the page
      cy.intercept('POST', 'https://cryptic-solver-backend.herokuapp.com/fetch-crossword', {})
  })


  it("should have sorry message", () => {
    cy.get('h1').contains("Sorry your crossword could not be found")
  })

  it("should have try again link", () => {
    cy.contains("Try again").click()
    // assert that we are on the home page
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

})
