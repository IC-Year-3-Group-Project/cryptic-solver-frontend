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
          clue: "See 3 down (4)",
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

    cy.get("[data-cy=grid-cell-0-0]").click({ force: true });
    cy.get("[data-cy=solve-cell").click({ force: true });

    cy.get("[data-cy=no-solutions]").contains("No solutions found");
  });

  it("solutions display if found", () => {
    // Mock return value for returned solution
    const mockSolution = "Yellow";
    cy.intercept("POST", "/solve-clue", [mockSolution]);

    cy.get("[data-cy=grid-cell-0-0]").click({ force: true });
    cy.get("[data-cy=solve-cell]").click({ force: true });

    for (let i = 1; i < mockSolution.length; i++) {
      cy.get(`[data-cy=grid-cell-0-${i}]`).contains(
        mockSolution[i].toUpperCase()
      );
    }
  });
});

describe("Homepage should allow crossword link and number entry", () => {
  it("has list of everyman crossword links to crosswords", () => {
    cy.intercept("GET", "/fetch-everyman", { urls: ["c1", "c2"] });
    cy.visit("/");
    cy.get("[data-cy=crossword-link]").should("exist");
  });

  it("can allow entry of crossword number", () => {
    cy.visit("/");

    cy.get("[data-cy=link-input]").type("3907{enter}");

    // The new url should reach crossword page
    cy.url().should(
      "eq",
      `${
        Cypress.config().baseUrl
      }/crossword?url=https://www.theguardian.com/crosswords/everyman/3907`
    );
  });

  it("can allow entry of crossword number", () => {
    cy.visit("/");

    // Input invalid URL into text box
    cy.get("[data-cy=link-input]").type("some-url");
    cy.get("[data-cy=fetch-crossword-button]").click();

    // The new url should reach crossword page
    cy.url().should("eq", `${Cypress.config().baseUrl}/crossword?url=some-url`);
  });
});

describe("Homepage should support answer entry", () => {
  it("find button should send api request", () => {
    const [answer, clue, explanation] = [
      "Parsnip",
      "Attaches blame when returning veg",
      "veg -> PARSNIP(reversal[when returning] PINSRAP(PINS=attaches + RAP=blame))",
    ];

    cy.visit("/");
    cy.intercept("POST", "/explain_answer", [explanation]).as("getExplanation");

    cy.get("[data-cy=answer-input]").type(answer);
    cy.get("[data-cy=clue-input]").type(clue);
    cy.get("[data-cy=find-explanation-button").click();

    cy.wait("@getExplanation").its("request.body").should("include", {
      answer: answer.toLowerCase(),
      clue: clue.toLowerCase(),
      word_length: answer.length,
    });

    cy.get("[data-cy=explanation-description]").contains(clue);
    cy.get("[data-cy=explanation]").contains(explanation);
  });

  it("error requests show error message", () => {
    cy.visit("/");
    cy.intercept("POST", "/explain_answer", { statusCode: 404 });

    cy.get("[data-cy=answer-input]").type("ibsen");
    cy.get("[data-cy=clue-input]").type("ibsen");
    cy.get("[data-cy=find-explanation-button").click();

    cy.get("[data-cy=answer-input]").contains("Sorry, an error has occurred");
  });

  it("validates clue", () => {
    cy.visit("/");
    cy.get("[data-cy=answer-input]").type("ibsen");
    cy.get("[data-cy=find-explanation-button").click();

    cy.get("[data-cy=clue-input]").contains("Clue mustn't be empty");
  });

  it("validates answer", () => {
    cy.visit("/");
    cy.get("[data-cy=clue-input]").type("ibsen");
    cy.get("[data-cy=find-explanation-button").click();

    cy.get("[data-cy=answer-input]").contains("Answer mustn't be empty");
  });

  it("validates all", () => {
    cy.visit("/");
    cy.get("[data-cy=find-explanation-button").click();

    cy.get("[data-cy=clue-input]").contains("Clue mustn't be empty");
    cy.get("[data-cy=answer-input]").contains("Answer mustn't be empty");
  });
});
