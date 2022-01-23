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
  Solution,
  solveWithPattern,
  solveWithPatternUnlikely,
  gradient,
  rgbToHex,
} from "./utils";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import SplitButton from "../SplitButton";
import Hide from "../Hide";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { SolutionMenu } from "./SolutionMenu";
import Box from "@mui/system/Box";
import {
  Snackbar,
  FormControlLabel,
  Grid,
  LinearProgress,
  Paper,
  Popover,
  Slider,
  Switch,
  Typography,
  AlertColor,
  TextField,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Backtracker,
  BacktrackingOptions,
  DefaultBacktrackingOptions,
} from "./Backtracking";
import { parseExplanation } from "./ExplanationParser/AntlrParser";

export interface CrosswordProps {
  puzzle: Puzzle;
  cellWidth: number;
  cellHeight: number;
}

const TriedMorseExplanation = "_TRIED_";

const ConfidenceGradient = [
  { r: 255, g: 0, b: 0 },
  { r: 255, g: 255, b: 0 },
  { r: 0, g: 255, b: 0 },
];

const AllowedCharacters =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BackspaceKey = "Backspace";
const LeftKey = "ArrowLeft";
const RightKey = "ArrowRight";
const UpKey = "ArrowUp";
const DownKey = "ArrowDown";
const TabKey = "Tab";
const EscapeKey = "Escape";

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

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return () => setValue((value) => value + 1);
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Crossword(props: CrosswordProps) {
  const { puzzle, cellWidth, cellHeight } = props;

  const [entries, setEntries] = useState<Array<GridEntry>>([]);
  const [selectedClue, setSelectedClue] = useState<Clue>();
  const [currentCell, setCurrentCell] = useState<GridEntry>();
  const [input, setInput] = useState<HTMLInputElement>();

  const [loadingSolution, setLoadingSolution] = useState(false);
  const [solutions, setSolutions] = useState<Array<Solution>>();
  const [explanation, setExplanation] = useState<string>();
  const [isMorseExplanation, setIsMorseExplanation] = useState(false);
  const [solveOverlayText, setSolveOverlayText] = useState<string>();
  const [solutionCache, setSolutionCache] = useState<{
    [key: string]: Solution[];
  }>({});
  const [morseExplanations, setMorseExplanations] = useState<{
    [key: string]: string;
  }>({});
  const [backtracker, setBacktracker] = useState<Backtracker>();
  const [backtrackOptions, setBacktrackOptions] = useState<BacktrackingOptions>(
    DefaultBacktrackingOptions
  );
  const [backtrackProgress, setBacktrackProgress] = useState<number>();
  const [backtrackCache, setBacktrackCache] = useState<{
    [key: string]: Solution[];
  }>({});
  const [incorrect, setIncorrect] = useState<Clue[]>();
  const [backtrackTime, setBacktrackTime] = useState(0);
  const [showBacktrackOptions, setShowBacktrackOptions] = useState(false);
  const backtrackOptionsAnchor = useRef(null);
  const solveOverlayTarget = useRef(null);
  const solutionMenuTarget = useRef(null);

  const [solveCancelToken, setSolveCancelToken] = useState(
    new AbortController()
  );
  let [cancelSolveGrid, setCancelSolveGrid] = useState(false);
  let [gridContinuation, setGridContinuation] = useState<number>();

  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [message, setMessage] = useState<string>(
    "The correct answer is Markov Chains"
  );
  const handleClickCheckAnswer = (clue: Clue) => {
    if (!clue.solution) {
      setSeverity("error");
      setMessage("Sorry, the true solution for this answer is not available.");
    } else {
      const answer = getClueText(clue);
      if (answer === clue.solution) {
        setSeverity("success");
        setMessage(`The answer ${answer} is correct!`);
      } else {
        setSeverity("warning");
        setMessage(`The answer ${answer} is not correct.`);
      }
    }
    setOpen(true);
  };

  const handleClickCheckAllAnswer = (score: number, total: number) => {
    if (score === 0) {
      setSeverity("error");
      setMessage(`${score}/${total}. Better luck next time.`);
    } else if (score < total - 5) {
      setSeverity("warning");
      setMessage(`${score}/${total}. Not bad.`);
    } else {
      setSeverity("success");
      setMessage(`${score}/${total}. Pretty good!`);
    }
    setOpen(true);
  };

  const handleCloseCheckAnswer = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const forceUpdate = useForceUpdate();

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

  function updateGridMulti(
    cells: { x: number; y: number }[],
    updated: Partial<GridEntry>[]
  ) {
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
    } else if (event.key == EscapeKey) {
      event.preventDefault();
      onCellClick(undefined);
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
        content: s == "_" ? undefined : s.toUpperCase(),
      }))
    );

    // If complete solution, lazy load explanation from haskell.
    const key = text.toUpperCase();
    const solutions = solutionCache[clue.getTitle()];
    if (solutions) {
      const solution = solutions.find(
        (s) => s.strippedAnswer.toUpperCase() == key && s.source == "morse"
      );
      if (solution) {
        morseExplanations[key] = solution.explanation;
        setMorseExplanations(morseExplanations);
        return;
      }
    }

    if (text.length == clue.totalLength && ![...text].some((c) => c == "_")) {
      if (!morseExplanations[key]) {
        morseExplanations[key] = TriedMorseExplanation;
        setMorseExplanations(morseExplanations);

        async function tryLoadMorseExplanation() {
          try {
            const explanation = await getExplanation(
              clue.getClueText().replace(/[\\/—]/g, ""),
              text.toUpperCase()
            );
            if (explanation.trim().length > 0) {
              morseExplanations[key] = explanation;
              setMorseExplanations(morseExplanations);
              forceUpdate();
            }
          } catch (ex) {}
        }

        tryLoadMorseExplanation();
      }
    }
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

  function addToSolutionCache(
    clue: Clue,
    solutions: Solution[],
    append?: boolean
  ) {
    if (solutions.length > 0) {
      const solutionList = append
        ? solutionCache[clue.getTitle()] ||
          (solutionCache[clue.getTitle()] = [])
        : [];
      (append
        ? solutions.filter(
            (s) =>
              !solutionList.some((s2) => s2.strippedAnswer == s.strippedAnswer)
          )
        : solutions
      ).forEach((s) => solutionList.push(s));
      solutionCache[clue.getTitle()] = solutionList;
      setSolutionCache({ ...solutionCache });
    }
  }

  function getConfidence(cell: GridEntry): number | undefined {
    let confidence: number | undefined = undefined;
    cell.clues.forEach((c) => {
      const sol = getSolution(c);
      if (sol) {
        confidence = (confidence || 1) * sol.confidence;
      }
    });

    return confidence;
  }

  // Calls the solver and fills in the given clue on the grid.
  async function solveClue(clue: Clue): Promise<boolean> {
    setSolveOverlayText(undefined);
    setLoadingSolution(true);
    try {
      const filledInAnswer = getClueText(clue).replace(/_/g, "?");
      // Strip html tags and word length brackets from clue.
      const strippedClue = clue.getClueText().replace(/[\\/—]/g, "");
      const pattern = clue.getSolutionPattern();
      let solutions = solutionCache[clue.getTitle()];
      if (!solutions) {
        solutions = await getExplainedSolutions(
          strippedClue,
          clue.totalLength,
          pattern,
          solveCancelToken.signal
        );
      }
      if ([...filledInAnswer].some((c) => c != "?")) {
        const patternSolutions = await solveWithPattern(
          strippedClue,
          clue.totalLength,
          pattern,
          filledInAnswer,
          solveCancelToken.signal
        );
        solutions = [
          ...patternSolutions.filter(
            (p) => !solutions.some((s) => s.answer == p.answer)
          ),
          ...solutions,
        ];
      }

      // Remove duplicate solutions
      const solutionSet = new Set();
      solutions = solutions.filter((solution) => {
        if (!solutionSet.has(solution.strippedAnswer)) {
          solutionSet.add(solution.strippedAnswer);
          return true;
        }
        return false;
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
    if (clue.showExplanation) {
      const enteredSolution = getClueText(clue);
      if (enteredSolution) {
        const morseExplanation = morseExplanations[enteredSolution];
        if (morseExplanation != TriedMorseExplanation) {
          return morseExplanation;
        }
      }

      const solution = getSolution(clue);
      if (solution) {
        return solution.explanation;
      }
      return "Could not explain solution.";
    }
  }

  function processHints(hints: string[], solution: string): string[] {
    const hintSet = new Set();
    let hintNumber = 0;
    const newHints = [];
    for (let hint of hints) {
      const wordSet = new Set(
        hint
          .replace(/[^a-zA-Z ]/g, "")
          .toLowerCase()
          .split(" ")
      );
      if (!hintSet.has(hint) && !wordSet.has(solution.toLowerCase())) {
        hintNumber += 1;
        newHints.push(`Hint #${hintNumber}: ${hint}`);
      }
      hintSet.add(hint);
    }
    return newHints;
  }

  async function getHintsFromExplanation(clue: Clue) {
    if (clue.solution) {
      let hints: string[] = [];
      if (!clue.explanation) {
        clue.explanation = await getExplanation(
          clue.getClueText().replace(/[\\/—]/g, ""),
          clue.solution
        );
        if (!clue.explanation) {
          const solutions = await solveWithPatternUnlikely(
            clue.getClueText(),
            clue.totalLength,
            `(${clue.lengths.join()})`,
            clue.solution
          );
          clue.explanation = solutions[0]?.explanation;
          if (!clue.explanation) {
            return ["No hints available"];
          }
          const sentences = clue.explanation.split(".");
          hints = getHints(sentences);
        } else {
          hints = parseExplanation(clue.explanation).toEnglish();
        }
      }

      hints = processHints(hints, clue.solution);

      if (hints.length < 1) {
        return ["No hints available"];
      }
      hints.push("No more hints available");
      return hints;
    }
    return ["No hints available"];
  }

  // Produce a hints array of all good hints from the sentences
  // in the explanation
  function getHints(sentences: string[]) {
    let hints = [];
    let start = 0;
    let end = 0;
    for (let i = 0; i < sentences.length; i++) {
      let sentence = sentences[i];

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
        hints.push(`The clue has a double definition.`);
      } else if (sentence.indexOf("' is the first definition") != -1) {
        start = sentence.indexOf("'");
        end = sentence.lastIndexOf("'");
        let definitionHint = sentence.substring(start, end + 1);
        hints.push(`The first definition is ${definitionHint}.`);
      } else if (sentence.indexOf("' is the second definition") != -1) {
        start = sentence.indexOf("'");
        end = sentence.lastIndexOf("'");
        let definitionHint = sentence.substring(start, end + 1);
        hints.push(`The second definition is ${definitionHint}.`);
      } else if (sentence.indexOf("' is the definition") != -1) {
        start = sentence.indexOf("'");
        end = sentence.lastIndexOf("'");
        let definitionHint = sentence.substring(start, end + 1);
        hints.push(`The definition is ${definitionHint}.`);
      } else if (sentence.indexOf("' is the wordplay") != -1) {
        start = sentence.indexOf("'");
        end = sentence.lastIndexOf("'");
        let wordplayHint = sentence.substring(start, end + 1);
        hints.push(`The wordplay is ${wordplayHint}.`);
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
        (sentence.indexOf("the letters") != 1 &&
          (sentence.indexOf("reversed") != -1 ||
            sentence.indexOf("backwards") != -1)) ||
        sentence.indexOf("anagramming") != -1 ||
        sentence.indexOf("' becomes '") != -1 ||
        sentence.indexOf("is a reversal indicator") != -1
      ) {
        hints.push(`${sentence}.`);
      } else if (sentence.indexOf("is hidden in the letters of") != -1) {
        let rest = sentence.substring(2);
        let start = rest.indexOf("'");
        rest = rest.substring(start + 1);
        hints.push(`The answer${rest}.`);
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
      const strippedClue = clue.getClueText().replace(/[\\/—]/g, "");
      const explanation = await getExplanation(
        strippedClue,
        answer,
        solveCancelToken.signal
      );
      if (explanation.length == 0) {
        setSolveOverlayText("Could not explain solution.");
      } else {
        setIsMorseExplanation(true);
        setExplanation(explanation);
      }
    } catch (ex: any) {
      if (!ex.message?.includes("aborted")) {
        console.log("Error loading explanation", ex);
        setSolveOverlayText("Error fetching explanation.");
      }
    }

    setLoadingSolution(false);
  }

  async function explainAnswerUnlikely(clue: Clue) {
    const answer = getClueText(clue);
    if (answer.includes("_")) {
      setSolveOverlayText("Cannot explain incomplete solution.");
      return;
    }

    setSolveOverlayText(undefined);
    setLoadingSolution(true);

    try {
      const explanation = await solveWithPatternUnlikely(
        clue.getClueText(),
        answer.length,
        `(${clue.lengths.join()})`,
        answer,
        solveCancelToken.signal
      );
      if (
        !explanation ||
        !explanation[0] ||
        explanation[0].explanation.length == 0
      ) {
        setSolveOverlayText("Could not explain solution.");
      } else {
        setIsMorseExplanation(false);
        setExplanation(explanation[0].explanation);
      }
    } catch (ex: any) {
      if (!ex.message?.includes("aborted")) {
        console.log("Error loading explanation", ex);
        setSolveOverlayText("Error fetching explanation.");
      }
    }

    setLoadingSolution(false);
  }

  // Loops through clues and calls the solver on all of them, filling in the grid along the way.
  async function solveAllClues(startIndex: number = 0) {
    puzzle.clues.forEach((clue) => {
      clue.hintLevel = 0;
      clue.showExplanation = true;
    });
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

  async function solveAllCluesAuto() {
    puzzle.clues.forEach((clue) => {
      clue.hintLevel = 0;
      clue.showExplanation = true;
    });
    const start = new Date().getTime();
    setIncorrect(undefined);
    setBacktrackProgress(undefined);
    setLoadingSolution(true);
    const backtrack = new Backtracker(
      puzzle,
      entries,
      setClueText,
      setBacktrackProgress,
      (c, s) => addToSolutionCache(c, s, true),
      onClueSelectedFromList,
      backtrackCache
    );
    backtrack.options = backtrackOptions;
    setBacktracker(backtrack);
    const success = await backtrack.solveAll();
    if (!success) {
      const xy = Array.from(
        { length: backtrack.bestGridContent.length },
        (_, i) => ({
          x: i % puzzle.columns,
          y: Math.floor(i / puzzle.columns),
        })
      );
      updateGridMulti(xy, backtrack.bestGridContent);
    }
    setBacktrackCache(backtrack.solutions);
    setBacktrackProgress(undefined);
    setLoadingSolution(false);
    onCellClick(undefined);
    const btIncorrect = puzzle.clues.filter(
      (c) => getClueText(c) != c.solution
    );
    if (!backtrack.cancelled) {
      setIncorrect(btIncorrect);
    }

    const localBacktrackTime = new Date().getTime() - start;
    setBacktrackTime(localBacktrackTime);
    setSeverity("success");
    setMessage(
      `${puzzle.clues.length - btIncorrect.length}/${
        puzzle.clues.length
      } correct in ${Math.round(localBacktrackTime * 10) / 10000}s`
    );
    setOpen(true);
  }

  const translateMorse = (explanation: string) => {
    try {
      const translation = parseExplanation(explanation).toEnglish().join(". ");
      return translation;
    } catch (error) {
      return "";
    }
  };

  const svgWidth = cellWidth * puzzle.columns;
  const svgHeight = cellHeight * puzzle.rows;
  const verticalWordBreaks = new Array<GridEntry>();
  const horizontalWordBreaks = new Array<GridEntry>();
  const wordBreakWidth = cellWidth / 8;
  const wordBreakHeight = cellHeight / 8;
  let currentConfidence = 0;
  return (
    <div className="crossword-container">
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleCloseCheckAnswer}
      >
        <Alert
          onClose={handleCloseCheckAnswer}
          severity={severity}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
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
              justifyContent: "start",
              flexWrap: "wrap",
              p: 2,
              maxHeight: svgHeight + cellHeight + 200,
            }}
          >
            <div
              style={{
                display: "flex",
                position: "relative",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                width: svgWidth,
                height: cellHeight,
                backgroundImage: `linear-gradient(to right, ${rgbToHex(
                  ConfidenceGradient[0]
                )}, ${rgbToHex(ConfidenceGradient[1])}, ${rgbToHex(
                  ConfidenceGradient[2]
                )}`,
              }}
            >
              <div>0%</div>
              <div>Cell Confidence</div>
              <div>100%</div>
              {currentCell &&
                (currentConfidence = getConfidence(currentCell) ?? 0) > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: cellHeight / 2,
                      left: `${(currentConfidence - 0.016) * svgWidth}px`,
                    }}
                  >
                    <span style={{ fontSize: "1rem" }}>&#9650;</span>
                  </div>
                )}
            </div>
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

                    let confidence = getConfidence(cell);
                    cell.clues.forEach((c) => {
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
                                    ConfidenceGradient,
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
            {(backtrackProgress || 0) > 0 && (
              <Box sx={{ width: `${svgWidth}px`, mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(100 * backtrackProgress!) / puzzle.clues.length}
                />
              </Box>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                paddingTop: "1rem",
              }}
            >
              {solutions && <div ref={solutionMenuTarget}></div>}
              <Button
                variant="contained"
                onClick={async () => {
                  await solveAllClues();
                }}
              >
                Solve Grid
              </Button>
              <Button
                sx={{ ml: 1 }}
                variant="contained"
                onClick={async () => {
                  await solveAllCluesAuto();
                }}
              >
                Solve Grid (Auto)
              </Button>
              <Button
                sx={{ ml: 1 }}
                variant="contained"
                onClick={async () => {
                  setCurrentCell(undefined);
                  setSolveOverlayText(undefined);
                  let score = 0;
                  let total = 0;
                  const startIndex = 0;
                  for (let i = startIndex; i < puzzle.clues.length; i++) {
                    const clue = puzzle.clues[i];
                    if (getClueText(clue) === clue.solution) {
                      score++;
                    }
                    total++;
                  }
                  handleClickCheckAllAnswer(score, total);
                }}
              >
                Check all
              </Button>
              <Button
                sx={{ ml: 1 }}
                variant="contained"
                color="secondary"
                onClick={() => {
                  puzzle.clues.forEach((clue) => {
                    clue.hintLevel = 0;
                    clue.showExplanation = false;
                  });
                  setIncorrect(undefined);
                  puzzle.clues.forEach(clearClueText);
                  setSelectedClue(undefined);
                }}
              >
                Clear All
              </Button>
              <IconButton
                sx={{ ml: 1 }}
                onClick={() => setShowBacktrackOptions(true)}
                ref={backtrackOptionsAnchor}
              >
                <SettingsIcon />
              </IconButton>
              <Popover
                anchorEl={backtrackOptionsAnchor.current}
                open={showBacktrackOptions}
                onClose={() => setShowBacktrackOptions(false)}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
              >
                <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                  <Typography variant="h5">Auto-Solve Settings</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={backtrackOptions.useHaskellBase}
                        onChange={(event) =>
                          setBacktrackOptions({
                            ...backtrackOptions,
                            useHaskellBase: event.target.checked,
                          })
                        }
                      />
                    }
                    label="Use Haskell For Unsolved Clues"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={backtrackOptions.useHaskellPartial}
                        onChange={(event) =>
                          setBacktrackOptions({
                            ...backtrackOptions,
                            useHaskellPartial: event.target.checked,
                          })
                        }
                      />
                    }
                    label="Use Haskell For Partially Solved Clues"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={backtrackOptions.triggerUpdateOnClear}
                        onChange={(event) =>
                          setBacktrackOptions({
                            ...backtrackOptions,
                            triggerUpdateOnClear: event.target.checked,
                          })
                        }
                      />
                    }
                    label="Clear Cells When Reversing Step"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={backtrackOptions.bestGridOnFailure}
                        onChange={(event) =>
                          setBacktrackOptions({
                            ...backtrackOptions,
                            bestGridOnFailure: event.target.checked,
                          })
                        }
                      />
                    }
                    label="Best Grid On Failure/Cancel"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        disabled={!backtrackOptions.bestGridOnFailure}
                        checked={backtrackOptions.bestGridByCells}
                        onChange={(event) =>
                          setBacktrackOptions({
                            ...backtrackOptions,
                            bestGridByCells: event.target.checked,
                          })
                        }
                      />
                    }
                    label="Judge Best Grid by Total Cells"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={backtrackOptions.useStaticCache}
                        onChange={(event) =>
                          setBacktrackOptions({
                            ...backtrackOptions,
                            useStaticCache: event.target.checked,
                          })
                        }
                      />
                    }
                    label="Maintain Clue Cache"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={backtrackOptions.delayBetweenInsert}
                        onChange={(event) =>
                          setBacktrackOptions({
                            ...backtrackOptions,
                            delayBetweenInsert: event.target.checked,
                          })
                        }
                      />
                    }
                    label="Delay Between Solution Inserts"
                  />
                  <TextField
                    label="Timeout (seconds)"
                    type="number"
                    value={
                      (backtrackOptions.timeout ?? 0) > 0
                        ? backtrackOptions.timeout
                        : ""
                    }
                    onChange={(event) =>
                      setBacktrackOptions({
                        ...backtrackOptions,
                        timeout: +event.target.value,
                      })
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="standard"
                    placeholder="None"
                  />
                  <Typography sx={{ pt: 1 }}>
                    Max Solve Retires ({backtrackOptions.maxSolutionRetries})
                  </Typography>
                  <Slider
                    value={backtrackOptions.maxSolutionRetries}
                    onChange={(_, val) =>
                      setBacktrackOptions({
                        ...backtrackOptions,
                        maxSolutionRetries: Number(val),
                      })
                    }
                    step={1}
                    min={0}
                    max={5}
                    valueLabelDisplay="auto"
                  />
                </Paper>
              </Popover>
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
                        `Get Hint ${selectedClue.getTitle()}`,
                        `Check Answer ${selectedClue.getTitle()}`,
                        `Explain ${selectedClue.getTitle()} (Morse)`,
                        `Explain ${selectedClue.getTitle()} (Unlikely)`,
                      ]}
                      onClick={async (index) => {
                        if (index == 0) {
                          await solveClue(selectedClue);
                        } else if (index == 1) {
                          selectedClue.showExplanation = true;
                          explainAnswerCached(selectedClue);
                          forceUpdate();
                        } else if (index == 2) {
                          selectedClue.hintLevel += 1;
                          forceUpdate();
                          if (
                            selectedClue.hintLevel > 0 &&
                            selectedClue.hints[0] === "Generating hints..."
                          ) {
                            selectedClue.hints = await getHintsFromExplanation(
                              selectedClue
                            );
                          }
                          forceUpdate();
                        } else if (index == 3) {
                          handleClickCheckAnswer(selectedClue);
                        } else if (index == 4) {
                          await explainAnswerHaskell(selectedClue);
                        } else if (index == 5) {
                          await explainAnswerUnlikely(selectedClue);
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
                        backtracker?.cancelSolve();
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
                      selectedClue.hintLevel = 0;
                      selectedClue.showExplanation = false;
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
            mb={2}
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
          {selectedClue && explanation && isMorseExplanation && (
            <p>{translateMorse(explanation)}</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExplanation(undefined)}>Ok</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
