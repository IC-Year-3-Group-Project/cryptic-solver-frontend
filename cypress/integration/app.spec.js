describe("Fetching crossword failure", () => {
  before(() => {
    // Mock return value to initiate error handling response from the page
    cy.intercept("POST", "/fetch-crossword", {});

    // runs once before all tests in the block
    cy.visit("/");

    // Input invalid URL into text box
    cy.get("[data-cy=link-input]").type("invalid-url{enter}");

    // The new url should reach crossword page
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/crossword?url=invalid-url`
    );
  });

  it("should have sorry message", () => {
    cy.get("[data-cy=sorry]").contains("Sorry");
  });

  it("should have try again link to home page", () => {
    cy.get("[data-cy=try-again]").click();

    // assert that we are on the home page
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);

    // The home page should contain an h1 with "Sorry"
    cy.get("[data-cy=title]").contains("Cryptic Crossword");
  });
});

describe("Fetching crossword success", () => {
  before(() => {
    // Mock return value for a valid crossword
    cy.intercept("POST", "/fetch-crossword", {
      id: "simple/1",
      number: 1,
      name: "Simple Crossword 1",
      date: 1542326400000,
      entries: [
        {
          id: "1-across",
          number: 1,
          humanNumber: "1",
          clue: "Toy on a string (2-2)",
          direction: "across",
          length: 4,
          group: ["1-across"],
          position: { x: 0, y: 0 },
          separatorLocations: {
            "-": [2],
          },
          solution: "YOYO",
        },
        {
          id: "2-across",
          number: 2,
          humanNumber: "2",
          clue: "Have a rest (3,4)",
          direction: "across",
          length: 7,
          group: ["2-across"],
          position: { x: 0, y: 2 },
          separatorLocations: {
            ",": [3],
          },
          solution: "LIEDOWN",
        },
        {
          id: "1-down",
          number: 1,
          humanNumber: "1",
          clue: "Colour (6)",
          direction: "down",
          length: 6,
          group: ["1-down"],
          position: { x: 0, y: 0 },
          separatorLocations: {},
          solution: "YELLOW",
        },
        {
          id: "3-down",
          number: 3,
          humanNumber: "3",
          clue: "Bits and bobs (4,3,4)",
          direction: "down",
          length: 7,
          group: ["3-down", "4-down"],
          position: { x: 3, y: 0 },
          separatorLocations: {
            ",": [4],
          },
          solution: "ODDSAND",
        },
        {
          id: "4-down",
          number: 4,
          humanNumber: "4",
          clue: "See 3 down",
          direction: "down",
          length: 4,
          group: ["3-down", "4-down"],
          position: {
            x: 6,
            y: 1,
          },
          separatorLocations: {},
          solution: "ENDS",
        },
      ],
      solutionAvailable: true,
      dateSolutionAvailable: 1542326400000,
      dimensions: {
        cols: 13,
        rows: 13,
      },
      crosswordType: "quick",
    });

    // runs once before all tests in the block
    cy.visit("/");

    // Input invalid URL into text box
    cy.get("[data-cy=link-input]").type("valid-url{enter}");

    // The new url should reach crossword page
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/crossword?url=valid-url`
    );
  });

  it("should have crossword component", () => {
    cy.get("rect").should("exist");
  });

  it("empty solutions display no solutions found", () => {
    // Mock return value for empty clue
    cy.intercept("POST", "/solve-clue", [""]);

    cy.get("[data-cy=find-solutions]").click({ force: true });

    cy.get("[data-cy=no-solutions]").contains("No solutions found");
  });

  it("solutions display if found", () => {
    // Mock return value for returned solution
    cy.intercept("POST", "/solve-clue", ["ibsen"]);

    cy.get("[data-cy=find-solutions]").click({ force: true });

    cy.get("[data-cy=found-solutions]").contains("Found solutions:");
  });
});