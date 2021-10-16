describe('Navigation', () => {
    it('should navigate to the about page', () => {
      // Start from the index page
      cy.visit('http://localhost:3000/')
  
      // Find a link with an href attribute containing "about" and click it
      cy.get('input').type('invalid-url{enter}')
  
      // The new url should include "/about"
      cy.url().should('include', '/crossword')
  
      // The new page should contain an h1 with "About page"
      cy.get('h1').contains('could not be found')
    })
  })

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