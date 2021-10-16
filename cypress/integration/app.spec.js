describe("Invalid urls bring up sorry message", () => {
  it("should navigate to the about page", () => {
    // Start from the index page
    cy.visit("/");

    // Input invalid URL into text box
    cy.get("input").type("invalid-url{enter}");

    // The new url should include "/crossword"
    cy.url().should("include", "/crossword");

    // The new page should contain an h1 with "Sorry"
    cy.get("h1").contains("Sorry");
  });
});

// describe("Fetching crossword fails should bring up sorry message", () => {

//   // Mock return value to initiate error handling response from the page
//   cy.intercept('POST', 'https://cryptic-solver-backend.herokuapp.com/fetch-crossword', {})

//   it("should have sorry message", () => {
//     cy.contains("Sorry your crossword could not be found")
//   })

//   it("should have try again link", () => {
//     cy.contains("Try again").click()
//   })

// })
