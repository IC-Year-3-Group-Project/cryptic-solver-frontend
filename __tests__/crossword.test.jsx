describe("Fetching crossword fails should bring up sorry message", () => {

  // Mock return value to initiate error handling response from the page
  cy.intercept('POST', 'https://cryptic-solver-backend.herokuapp.com/fetch-crossword', {})

  it("should have sorry message", () => {
    cy.contains("Sorry your crossword could not be found")
  })

  it("should have try again link", () => {
    cy.contains("Try again").click()
  })

})