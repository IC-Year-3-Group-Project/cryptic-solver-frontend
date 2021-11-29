import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import Tooltip from "react-bootstrap/Tooltip";
import Overlay from "react-bootstrap/Overlay";
import ClueList from "./ClueList";
import { Clue, ClueDirection } from "./model/Clue";
import { GridEntry } from "./model/GridEntry";
import { Puzzle, toIndex } from "./model/Puzzle";
import {
  getExplainedSolutions,
  getExplanation,
  getSolutions,
  getUnlikelySolutions,
  Solution,
  solveWithPattern,
  solveWithPatternUnlikely,
  stripSolution,
  gradient,
  rgbToHex,
} from "./utils";
import Button from "@mui/material/Button";
import SplitButton from "../SplitButton";
import Hide from "../Hide";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { SolutionMenu } from "./SolutionMenu";
import Box from "@mui/system/Box";
import { sortedUniqBy } from "cypress/types/lodash";
import { Grid } from "@mui/material";

export interface CrosswordProps {
  puzzle: Puzzle;
  cellWidth: number;
  cellHeight: number;
}

const AllowedCharacters =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BackspaceKey = "Backspace";
const LeftKey = "ArrowLeft";
const RightKey = "ArrowRight";
const UpKey = "ArrowUp";
const DownKey = "ArrowDown";
const TabKey = "Tab";

const KeyDirections: {
  [key: string]: { direction: ClueDirection; delta: number };
} = {
  [LeftKey]: { direction: ClueDirection.Across, delta: -1 },
  [RightKey]: { direction: ClueDirection.Across, delta: 1 },
  [UpKey]: { direction: ClueDirection.Down, delta: -1 },
  [DownKey]: { direction: ClueDirection.Down, delta: 1 },
};

export const ClueSelectionColour = "#FFF7B2";
export const CellSelectionColour = "#FFE500";

export default function Crossword(props: CrosswordProps) {
  const { puzzle, cellWidth, cellHeight } = props;

  const [entries, setEntries] = useState<Array<GridEntry>>([]);
  const [selectedClue, setSelectedClue] = useState<Clue>();
  const [currentCell, setCurrentCell] = useState<GridEntry>();
  const [input, setInput] = useState<HTMLInputElement>();

  const [loadingSolution, setLoadingSolution] = useState(false);
  const [solutions, setSolutions] = useState<Array<Solution>>();
  const [explanation, setExplanation] = useState<string>();
  const [solveOverlayText, setSolveOverlayText] = useState<string>();
  const [solutionCache, setSolutionCache] = useState<{
    [key: string]: Solution[];
  }>({});
  const solveOverlayTarget = useRef(null);
  const solutionMenuTarget = useRef(null);

  const [solveCancelToken, setSolveCancelToken] = useState(
    new AbortController()
  );
  let [cancelSolveGrid, setCancelSolveGrid] = useState(false);
  let [gridContinuation, setGridContinuation] = useState<number>();

  useEffect(() => {
    if (puzzle) {
      setSolutionCache({});
      const newEntries = new Array<GridEntry>();
      const clueMap: { [key: string]: Clue[] } = {};
      // Build x,y -> clue mapping.
      puzzle.clues.forEach((clue) => {
        const xyMax = [clue.x, clue.y];
        xyMax[clue.direction] += clue.totalLength;
        xyMax[1 - clue.direction]++;
        for (let x = clue.x; x < xyMax[0]; x++) {
          for (let y = clue.y; y < xyMax[1]; y++) {
            let map = clueMap[`${x},${y}`];
            if (!map) {
              clueMap[`${x},${y}`] = map = [];
            }
            map.push(clue);
          }
        }
      });

      // Build entry array.
      for (let y = 0; y < puzzle.rows; y++) {
        for (let x = 0; x < puzzle.columns; x++) {
          const clues = clueMap[`${x},${y}`] || [];
          const entry = new GridEntry();
          entry.editable = clues.length > 0;
          entry.user = false;
          entry.clues = clues;
          entry.clueStarts = clues.filter((c) => c.x == x && c.y == y);
          entry.x = x;
          entry.y = y;
          newEntries.push(entry);
        }
      }

      // Update state.
      setEntries(newEntries);
    }
  }, [puzzle]);

  // Auto-Complete the grid in hands-off mode
  async function autoCompleteGrid() {
    setCancelSolveGrid(false);
    setLoadingSolution(true);
    let entrySet = entries.filter((e) => e != undefined).map((e) => true);

    const tempClues = puzzle.clues; //.slice(0, 4);
    const solutionList: Solution[][] = [];
    for (let i = 0; i < tempClues.length; i++) {
      try {
        const c = tempClues[i];
        const solutions = await getUnlikelySolutions(
          c.getClueText(),
          c.totalLength,
          c.getSolutionPattern()
        );
        addToSolutionCache(c, solutions);
        solutionList.push(solutions);
      } catch (ex) {
        console.log(ex);
        solutionList.push([]);
      }
    }

    let cluesAndSolutions: [Clue, Solution[]][] = tempClues.map(function (
      e,
      i
    ) {
      return [e, solutionList[i]];
    });

    cluesAndSolutions.sort((a, b) => a[1].length - b[1].length);

    await backtrack(cluesAndSolutions, entrySet);
    setLoadingSolution(false);
  }

  // Backtracking algorithm starting with the clues with the lowest number of solutions
  async function backtrack(
    cluesAndSolutions: [Clue, Solution[]][],
    entrySet: boolean[]
  ) {
    if (
      cluesAndSolutions.length == 0 ||
      !entrySet.some((e) => e) ||
      cancelSolveGrid
    ) {
      return true;
    }

    let clueSolPair: [Clue, Solution[]] = cluesAndSolutions[0];
    let clueSingle: Clue = clueSolPair[0];
    let solutionList: Solution[] = clueSolPair[1];

    for (let j = 0; j < solutionList.length; j++) {
      let solution = solutionList[j];

      // Save all states to reset after trying
      let oldCluesAndSolutions = [...cluesAndSolutions];
      let oldEntries = [...entries];
      let oldEntrySet = [...entrySet];

      cluesAndSolutions.shift();

      setClueText(clueSingle, solution.strippedAnswer);

      let gridEntries = clueSingle
        .generateVertices()
        .map((c) => entries[toIndex(puzzle, c.x, c.y)]);

      gridEntries.forEach((g) => (entrySet[toIndex(puzzle, g.x, g.y)] = false));

      let toUpdate = gridEntries
        .filter((a) => a.clues.length != 1)
        .map((e) => e.clues)
        .reduce((a, b) => a.concat(b));

      const reRequest = cluesAndSolutions.filter(
        (cSPair) =>
          toUpdate.find((e) => e.x == cSPair[0].x && e.y == cSPair[0].y) ||
          false
      );
      for (let k = 0; k < reRequest.length; k++) {
        let me = reRequest[k];
        try {
          const solutions = await solveWithPatternUnlikely(
            me[0].getClueText(),
            me[0].totalLength,
            me[0].getSolutionPattern(),
            getClueText(me[0]).replaceAll("_", "?")
          );
          addToSolutionCache(me[0], solutions);
          cluesAndSolutions[
            cluesAndSolutions.findIndex(
              (p) => p[0].x == me[0].x && p[0].y == me[0].y
            )
          ] = [me[0], solutions];
        } catch (ex) {
          console.log(ex);
          cluesAndSolutions[
            cluesAndSolutions.findIndex(
              (p) => p[0].x == me[0].x && p[0].y == me[0].y
            )
          ] = [me[0], []];
        }
      }

      cluesAndSolutions.sort((a, b) =>
        a[1].length == 0 ? 1 : b[1].length == 0 ? -1 : a[1].length - b[1].length
      );

      if (await backtrack(cluesAndSolutions, entrySet)) {
        return true;
      }

      entrySet = oldEntrySet;
      setEntries(oldEntries);
      cluesAndSolutions = oldCluesAndSolutions;
    }
    return false;
  }

  // Update an entry in the current grid.
  function updateGrid(cell: { x: number; y: number }, updated: any) {
    const index = toIndex(puzzle, cell.x, cell.y);
    const copy = [...entries];
    copy[index] = Object.assign(entries[index], updated);
    if (currentCell && currentCell.positionEquals(cell)) {
      currentCell.content = copy[index].content;
    }

    setEntries(copy);
  }

  function updateGridMulti(cells: { x: number; y: number }[], updated: any[]) {
    const copy = [...entries];
    for (let i = 0; i < cells.length && i < updated.length; i++) {
      const cell = cells[i];
      const newData = updated[i];
      const index = toIndex(puzzle, cell.x, cell.y);
      copy[index] = Object.assign(entries[index], newData);

      if (currentCell && currentCell.positionEquals(cell)) {
        currentCell.content = copy[index].content;
      }
    }

    setEntries(copy);
  }

  // Find cell in given direction.
  function travel(
    fromX: number,
    fromY: number,
    direction: ClueDirection,
    delta: number = 1
  ): GridEntry | undefined {
    const xy = [fromX, fromY];
    xy[direction] += delta;
    const [x, y] = xy;
    return x < 0 || x >= puzzle.columns || y < 0 || y >= puzzle.rows
      ? undefined
      : entries[toIndex(puzzle, x, y)];
  }

  function onCellKeyDown(event: KeyboardEvent) {
    if (
      currentCell &&
      selectedClue &&
      AllowedCharacters.includes(event.key) &&
      currentCell.content
    ) {
      updateGrid(currentCell, { content: "" });
    } else if (event.key == TabKey) {
      event.preventDefault();
    }
  }

  // Handles a cell key up event. This is used for keyboard navigation/backspace handling.
  function onCellKeyUp(event: KeyboardEvent) {
    if (currentCell && selectedClue) {
      if (event.code == BackspaceKey) {
        if (currentCell.content) {
          // If the current cell has content, delete it.
          updateGrid(currentCell, { content: undefined });
        } else {
          // Otherwise, if cell is empty, travel backwards in clue direction.
          const nextCell = travel(
            currentCell.x,
            currentCell.y,
            selectedClue.direction,
            -1
          );
          if (nextCell) {
            onCellClick(nextCell, true);
          }
        }
      } else if (KeyDirections[event.code]) {
        // Move with arrow keys.
        const move = KeyDirections[event.code];
        const nextCell = travel(
          currentCell.x,
          currentCell.y,
          move.direction,
          move.delta
        );
        if (nextCell) {
          onCellClick(nextCell, nextCell.clues.length > 1);
        }
      } else if (event.code == TabKey) {
        // Tab key changes direction.
        onCellClick(currentCell);
      }
    }
  }

  // Handles text input into cell.
  function onCellValueEntered(value: string) {
    if (
      selectedClue &&
      currentCell &&
      value?.length == 1 &&
      AllowedCharacters.includes(value)
    ) {
      updateGrid(currentCell, { content: value.toUpperCase() });
      const nextCell = travel(
        currentCell.x,
        currentCell.y,
        selectedClue.direction
      );
      if (nextCell) {
        onCellClick(nextCell, true);
      }
    }
  }

  // Handles cell selection and clue-picking.
  function onCellClick(cell: GridEntry | undefined, force: boolean = false) {
    if (loadingSolution) {
      return;
    }

    setSolveOverlayText(undefined);

    if (!cell) {
      setCurrentCell(undefined);
      setSelectedClue(undefined);
      return;
    }

    if (!cell.editable) {
      return;
    }

    if (!force) {
      if (
        cell.positionEquals(currentCell) &&
        selectedClue &&
        cell.clues.length > 1
      ) {
        // If we have reselected the same cell and the cell belongs to two clues, change direction.
        setSelectedClue(
          cell.clues.filter((c) => c.direction != selectedClue.direction)[0]
        );
      } else {
        // If a clue is currently selected, pick the clue in the same direction before picking any other clue.
        // Otherwise, pick a clue this cell belongs to, first picking any clues that start in this cell.
        let clueCandiadates = selectedClue
          ? cell.clues.filter((c) => c.direction == selectedClue.direction)
          : cell.clueStarts;
        if (clueCandiadates.length == 0) {
          clueCandiadates = cell.clues;
        }
        setSelectedClue(clueCandiadates[0]);
      }
    }

    input?.focus();
    setCurrentCell(cell);
  }

  // Handles a clue being selected from the down and across ClueList components.
  function onClueSelectedFromList(clue: Clue) {
    const index = toIndex(puzzle, clue.x, clue.y);
    if (index >= 0 && index < entries.length) {
      setCurrentCell(entries[index]);
      setSelectedClue(clue);
    }

    setSolveOverlayText(undefined);
    input?.focus();
  }

  function getClueText(clue?: Clue): string {
    clue = clue || selectedClue;
    if (!clue) {
      return "_".repeat(Math.max(puzzle.rows, puzzle.columns));
    }

    return clue
      .generateVertices()
      .map((v) => entries[toIndex(puzzle, v.x, v.y)].content || "_")
      .join("");
  }

  function setClueText(clue: Clue, text: string) {
    updateGridMulti(
      clue.generateVertices(),
      [...text].map((s) => ({
        content: s.toUpperCase(),
      }))
    );
  }

  function clearClueText(clue: Clue) {
    updateGridMulti(
      clue.generateVertices(),
      Array.from({ length: clue.totalLength }, (_, i) => ({
        content: undefined,
      }))
    );
  }

  // Cancels the current clue solve request.
  function cancelSolveClue() {
    solveCancelToken.abort();
    setSolveCancelToken(new AbortController());
    setLoadingSolution(false);
  }

  function fits(clue: Clue, answer: string, same: boolean): boolean {
    if (answer.length != clue.totalLength) {
      return false;
    }

    const clueText = getClueText(clue);
    answer = answer.toUpperCase();
    return ![...clueText].some((char, index) =>
      same ? char != answer[index] : char != "_" && char != answer[index]
    );
  }

  function addToSolutionCache(clue: Clue, solutions: Solution[]) {
    solutionCache[clue.getTitle()] = solutions;
    setSolutionCache({ ...solutionCache });
  }

  function checkExistingSolutionInArray(
    solution: Solution,
    solutions: Solution[]
  ) {
    return solutions.some((existing) => {
      return existing.answer === solution.answer;
    });
  }

  // Calls the solver and fills in the given clue on the grid.
  async function solveClue(clue: Clue): Promise<boolean> {
    setSolveOverlayText(undefined);
    setLoadingSolution(true);
    try {
      const filledInAnswer = getClueText(clue).replace(/_/g, "?");
      const strippedClue = clue.getClueText();
      const pattern = clue.getSolutionPattern();
      let solutions = solutionCache[clue.getTitle()];
      if (!solutions) {
        // Strip html tags and word length brackets from clue.
        solutions = await getExplainedSolutions(
          strippedClue,
          clue.totalLength,
          pattern,
          solveCancelToken.signal
        );
      }
      const patternSolutions = await solveWithPattern(
        strippedClue,
        clue.totalLength,
        pattern,
        filledInAnswer,
        solveCancelToken.signal
      );
      patternSolutions.forEach((solution) => {
        if (!checkExistingSolutionInArray(solution, solutions)) {
          solutions.push(solution);
        }
      });
      if (solutions.length > 0) {
        addToSolutionCache(clue, solutions);
        if (
          solutions.length > 1 ||
          !fits(clue, solutions[0].strippedAnswer, false)
        ) {
          setSolutions(solutions);
          setLoadingSolution(false);
          return true;
        } else {
          setClueText(clue, solutions[0].strippedAnswer);
        }
      } else {
        setSolveOverlayText("No solutions found.");
      }
    } catch (ex: any) {
      if (!ex.message?.includes("aborted")) {
        console.log("Error loading solutions", ex);
        setSolveOverlayText("Error fetching solutions.");
      }
    }

    setLoadingSolution(false);
    return false;
  }

  function getSolution(clue: Clue): Solution | undefined {
    const solutions = solutionCache[clue.getTitle()];
    if (solutions) {
      const clueText = getClueText(clue);
      return solutions.find((s) => s.strippedAnswer == clueText);
    }
  }

  function explainAnswerCached(clue: Clue) {
    const solution = getSolution(clue);
    if (solution) {
      // setExplanation(solution.explanation);
      return solution.explanation;
    }
    // setSolveOverlayText("Could not explain solution.");
    return "Could not explain solution.";
  }

  function getHintsFromExplanation(clue: Clue) {
    const solution = getSolution(clue);
    if (solution) {
      console.log(
        `Generating hints from ${solution.explanation} at level ${solution.hintLevel}`
      );

      const sentences = solution.explanation.split(".");
      let hints = getHints(sentences);

      if (hints.length < solution.hintLevel) {
        hints.push("No more hints available");
        return hints;
      }
      return hints.slice(0, solution.hintLevel);
    }
    return ["No hints available"];
  }

  // Produce a hints array of all good hints from the sentences
  // in the explanation
  function getHints(sentences: string[]) {
    let hints = [];
    let hintNumber = 0;
    let start = 0;
    let end = 0;
    for (let i = 0; i < sentences.length; i++) {
      let sentence = sentences[i];
      hintNumber++;

      // Trim the additional explanation in brackets because
      // sometimes it expresses uncertainty e.g. "I am not sure"
      if (sentence.indexOf("(") == 1) {
        let closingBracketIndex = sentence.indexOf(")");
        sentence = sentence.substring(closingBracketIndex + 1);
      }

      if (sentence.lastIndexOf(")") == sentence.length - 1) {
        let openingBracketIndex = sentence.indexOf("(");
        sentence = sentence.substring(0, openingBracketIndex);
      }

      if (sentence.indexOf("is a double definition") != -1) {
        hints.push(`Hint #${hintNumber}: The clue has a double definition.`);
      } else if (sentence.indexOf("' is the first definition") != -1) {
        start = sentence.indexOf("'");
        end = sentence.lastIndexOf("'");
        let definitionHint = sentence.substring(start, end + 1);
        hints.push(
          `Hint #${hintNumber}: The first definition is ${definitionHint}.`
        );
      } else if (sentence.indexOf("' is the second definition") != -1) {
        start = sentence.indexOf("'");
        end = sentence.lastIndexOf("'");
        let definitionHint = sentence.substring(start, end + 1);
        hints.push(
          `Hint #${hintNumber}: The second definition is ${definitionHint}.`
        );
      } else if (sentence.indexOf("' is the definition") != -1) {
        start = sentence.indexOf("'");
        end = sentence.lastIndexOf("'");
        let definitionHint = sentence.substring(start, end + 1);
        hints.push(`Hint #${hintNumber}: The definition is ${definitionHint}.`);
      } else if (sentence.indexOf("' is the wordplay") != -1) {
        start = sentence.indexOf("'");
        end = sentence.lastIndexOf("'");
        let wordplayHint = sentence.substring(start, end + 1);
        hints.push(`Hint #${hintNumber}: The wordplay is ${wordplayHint}.`);
      } else if (
        sentence.indexOf("take the first letters") != -1 ||
        sentence.indexOf("taking the first letters") != -1 ||
        sentence.indexOf("take the initial letters") != -1 ||
        sentence.indexOf("taking the initial letters") != -1 ||
        sentence.indexOf("removing the last letter") != -1 ||
        sentence.indexOf("to remove the last letter") != -1 ||
        sentence.indexOf("to remove the final letter") != -1 ||
        sentence.indexOf("removing the final letter") != -1 ||
        sentence.indexOf("removing the first letter") != -1 ||
        sentence.indexOf("to remove the first letter") != -1 ||
        sentence.indexOf("take alternating letters") != -1 ||
        sentence.indexOf("taking alternating letters") != -1 ||
        sentence.indexOf("one lot of letters") != -1 ||
        sentence.indexOf("the letters") != 1 && 
                (sentence.indexOf("reversed") != -1  || sentence.indexOf("backwards") != -1) ||
        sentence.indexOf("anagramming") != -1 ||
        sentence.indexOf("' becomes '") != -1 ||
        sentence.indexOf("is a reversal indicator") != -1) {
        hints.push(`Hint #${hintNumber}: ${sentence}.`);
      } else if (sentence.indexOf("is hidden in the letters of") != -1) {
        let rest = sentence.substring(2);
        let start = rest.indexOf("'");
        rest = rest.substring(start + 1);
        hints.push(`Hint #${hintNumber}: The answer${rest}.`);
      } else {
        hintNumber--;
      }
    }

    return hints;
  }

  async function explainAnswerHaskell(clue: Clue) {
    const answer = getClueText(clue);
    if (answer.includes("_")) {
      setSolveOverlayText("Cannot explain incomplete solution.");
      return;
    }

    setSolveOverlayText(undefined);
    setLoadingSolution(true);

    try {
      const strippedClue = clue.getClueText();
      const explanation = await getExplanation(
        strippedClue,
        answer,
        solveCancelToken.signal
      );
      if (explanation.length == 0) {
        setSolveOverlayText("Could not explain solution.");
      } else {
        setExplanation(explanation);
      }
    } catch (ex: any) {
      if (!ex.message?.includes("aborted")) {
        console.log("Error loading explanation", ex);
        setSolveOverlayText("Error fetching explaination.");
      }
    }

    setLoadingSolution(false);
  }

  // Loops through clues and calls the solver on all of them, filling in the grid along the way.
  async function solveAllClues(startIndex: number = 0) {
    setGridContinuation((gridContinuation = undefined));
    setCancelSolveGrid((cancelSolveGrid = false));
    setCurrentCell(undefined);
    for (let i = startIndex; i < puzzle.clues.length; i++) {
      if (cancelSolveGrid) {
        break;
      }

      const clue = puzzle.clues[i];
      setSelectedClue(clue);
      const multiSolutions = await solveClue(clue);
      if (multiSolutions) {
        setGridContinuation(i + 1);
        break;
      }
    }

    setSolveOverlayText(undefined);
  }

  async function onSolutionSelected(solution?: Solution) {
    setSolutions(undefined);

    if (selectedClue) {
      if (solution) {
        setClueText(selectedClue, solution.strippedAnswer);
      }

      if (gridContinuation) {
        await solveAllClues(gridContinuation);
      }
    }
  }

  const svgWidth = cellWidth * puzzle.columns;
  const svgHeight = cellHeight * puzzle.rows;
  const verticalWordBreaks = new Array<GridEntry>();
  const horizontalWordBreaks = new Array<GridEntry>();
  const wordBreakWidth = cellWidth / 8;
  const wordBreakHeight = cellHeight / 8;
  return (
    <div className="crossword-container">
      {puzzle && (
        <Grid container direction="row">
          <Grid
            item
            xs={12}
            md={12}
            xl={4}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              overflow: "auto",
              flexWrap: "wrap",
              p: 2,
            }}
          >
            <div
              className="crossword-svg-container"
              style={{ width: svgWidth, height: svgHeight }}
            >
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="xMidYMid meet"
              >
                <rect width={svgWidth} height={svgHeight} color="black"></rect>
                {entries
                  .filter((cell) => cell.editable)
                  .map((cell, index) => {
                    const [xPos, yPos] = [
                      cell.x * cellWidth,
                      cell.y * cellHeight,
                    ];

                    let confidence: number | undefined = undefined;
                    cell.clues.forEach((c) => {
                      const sol = getSolution(c);
                      if (sol) {
                        confidence = (confidence || 1) * sol.confidence;
                      }
                      if (c.isHorizontalWordBreak(cell.x, cell.y)) {
                        horizontalWordBreaks.push(cell);
                      }

                      if (c.isVerticalWordBreak(cell.x, cell.y)) {
                        verticalWordBreaks.push(cell);
                      }
                    });

                    return (
                      <g
                        key={index}
                        onClick={() => onCellClick(cell)}
                        data-cy={`grid-cell-${cell.x}-${cell.y}`}
                      >
                        <rect
                          x={xPos + 1}
                          y={yPos + 1}
                          width={cellWidth - 2}
                          height={cellHeight - 2}
                          fill={
                            selectedClue &&
                            selectedClue.contains(cell.x, cell.y)
                              ? ClueSelectionColour
                              : confidence
                              ? rgbToHex(
                                  gradient(
                                    [
                                      { r: 255, g: 0, b: 0 },
                                      { r: 255, g: 255, b: 0 },
                                      { r: 0, g: 255, b: 0 },
                                    ],
                                    confidence,
                                    (x) => x
                                  )
                                )
                              : "#FFFFFF"
                          }
                        ></rect>
                        {cell.clueStarts?.length > 0 && (
                          <text x={xPos + 2} y={yPos + 10} fontSize="0.625rem">
                            {cell.clueStarts[0].number}
                          </text>
                        )}
                        {cell.content && !cell.positionEquals(currentCell) && (
                          <text
                            x={xPos + cellWidth / 2}
                            y={yPos + cellHeight / 1.4}
                            fontSize="1rem"
                            textAnchor="middle"
                          >
                            {cell.content}
                          </text>
                        )}
                        {cell.positionEquals(currentCell) && (
                          <rect
                            ref={solveOverlayTarget}
                            x={xPos + 1}
                            y={yPos + 1}
                            width={cellWidth - 2}
                            height={cellHeight - 2}
                            className="crossword-cell-selected"
                          ></rect>
                        )}
                      </g>
                    );
                  })}
                {horizontalWordBreaks.map((cell, index) => {
                  const [xPos, yPos] = [
                    cell.x * cellWidth,
                    cell.y * cellHeight,
                  ];
                  return (
                    <line
                      key={index}
                      x1={xPos + cellWidth - wordBreakWidth}
                      x2={xPos + cellWidth + wordBreakWidth}
                      y1={yPos + cellHeight / 2 - 0.5}
                      y2={yPos + cellHeight / 2 - 0.5}
                      stroke="#000000FF"
                      strokeWidth={1}
                    />
                  );
                })}
                {verticalWordBreaks.map((cell, index) => {
                  const [xPos, yPos] = [
                    cell.x * cellWidth,
                    cell.y * cellHeight,
                  ];
                  return (
                    <line
                      key={index}
                      x1={xPos + cellWidth / 2 - 0.5}
                      x2={xPos + cellWidth / 2 - 0.5}
                      y1={yPos + cellHeight - wordBreakHeight}
                      y2={yPos + cellHeight + wordBreakHeight}
                      stroke="#000000FF"
                      strokeWidth={1}
                    />
                  );
                })}
              </svg>
              {currentCell && (
                <div
                  style={{
                    position: "absolute",
                    left: `${(100 * currentCell.x) / puzzle.columns}%`,
                    top: `${(100 * currentCell.y) / puzzle.rows}%`,
                    width: `${100 / puzzle.columns}%`,
                    height: `${100 / puzzle.rows}%`,
                  }}
                >
                  <input
                    className="crossword-input"
                    onClick={() => onCellClick(currentCell)}
                    onChange={(e) => onCellValueEntered(e.target.value)}
                    onKeyDown={onCellKeyDown}
                    onKeyUp={onCellKeyUp}
                    value={currentCell.content ?? ""}
                    ref={(ref) => ref && setInput(ref)}
                    data-cy="grid-input"
                  ></input>
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                paddingTop: "1rem",
              }}
            >
              {solutions && <div ref={solutionMenuTarget}></div>}
              <SplitButton
                options={["Solve Grid", "Solve Grid (Auto)"]}
                variant="contained"
                color="primary"
                disabled={loadingSolution}
                onClick={async (index) => {
                  if (index == 0) {
                    await solveAllClues();
                  } else if (index == 1) {
                    await autoCompleteGrid();
                  }
                }}
              ></SplitButton>
              <Button
                sx={{ ml: 1 }}
                variant="contained"
                color="secondary"
                onClick={() => puzzle.clues.forEach(clearClueText)}
              >
                Clear Grid
              </Button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                paddingTop: "1rem",
              }}
            >
              {selectedClue && (
                <>
                  <Hide if={loadingSolution}>
                    <SplitButton
                      options={[
                        `Solve ${selectedClue.getTitle()}`,
                        `Explain ${selectedClue.getTitle()}`,
                        `Explain ${selectedClue.getTitle()} (Haskell)`,
                        `Get Hint ${selectedClue.getTitle()}`,
                      ]}
                      onClick={async (index) => {
                        if (index == 0) {
                          await solveClue(selectedClue);
                        } else if (index == 1) {
                          explainAnswerCached(selectedClue);
                        } else if (index == 2) {
                          await explainAnswerHaskell(selectedClue);
                        } else if (index == 3) {
                          const solutionToIncrement = getSolution(selectedClue);
                          if (solutionToIncrement) {
                            solutionToIncrement.hintLevel += 1;
                            solutionCache[selectedClue.getTitle()].forEach(
                              (solution) => {
                                if (
                                  solution.explanation ===
                                  solutionToIncrement.explanation
                                ) {
                                  return solutionToIncrement;
                                }
                                return solution;
                              }
                            );
                            setSolutionCache({ ...solutionCache });
                          }
                        }
                      }}
                      cypress-data="solve-cell"
                    />
                  </Hide>
                  {loadingSolution && (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        setSolutions(undefined);
                        setCancelSolveGrid(true);
                        cancelSolveClue();
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    sx={{ ml: 1 }}
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      clearClueText(selectedClue);
                      onCellClick(
                        entries[
                          toIndex(puzzle, selectedClue.x, selectedClue.y)
                        ],
                        true
                      );
                    }}
                  >
                    Clear Clue
                  </Button>
                  <Overlay
                    target={solveOverlayTarget.current}
                    show={solveOverlayText != undefined}
                    placement="top"
                  >
                    {(props) => (
                      <Tooltip {...props} data-cy="no-solutions">
                        {solveOverlayText}
                      </Tooltip>
                    )}
                  </Overlay>
                </>
              )}
            </div>
          </Grid>
          <Grid
            item
            container
            direction="row"
            justifyContent="center"
            xs={12}
            md={12}
            xl={8}
          >
            <ClueList
              clues={puzzle.clues.filter(
                (c) => c.direction == ClueDirection.Across
              )}
              title="Across"
              onClueClicked={onClueSelectedFromList}
              selectedClue={selectedClue}
              explainAnswer={explainAnswerCached}
              getHints={getHintsFromExplanation}
            />
            <ClueList
              clues={puzzle.clues.filter(
                (c) => c.direction == ClueDirection.Down
              )}
              title="Down"
              onClueClicked={onClueSelectedFromList}
              selectedClue={selectedClue}
              explainAnswer={explainAnswerCached}
              getHints={getHintsFromExplanation}
            />
          </Grid>
        </Grid>
      )}
      <SolutionMenu
        solutions={solutions}
        currentText={getClueText()}
        anchor={solveOverlayTarget?.current ?? solutionMenuTarget?.current}
        onSolutionSelected={onSolutionSelected}
      />
      <Dialog open={explanation != undefined}>
        <DialogTitle>Explanation for {selectedClue?.getTitle()}</DialogTitle>
        <DialogContent>
          <p>Clue: {selectedClue?.text}</p>
          <p>Explanation: {explanation}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExplanation(undefined)}>Ok</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
