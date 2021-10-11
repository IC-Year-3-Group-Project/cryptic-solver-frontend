import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "../pages/index";

describe("Home", () => {
  it("renders a heading", () => {
    render(<Home />);

    const heading = screen.getByRole("heading", {
      name: "Cryptic Crossword Solver",
    });

    expect(heading).toBeInTheDocument();
  });
  it("renders a input box", () => {
    render(<Home />);

    const inputBox = screen.getByRole("textbox", {
      type: "text",
    });

    expect(inputBox).toBeInTheDocument();
  });
});
