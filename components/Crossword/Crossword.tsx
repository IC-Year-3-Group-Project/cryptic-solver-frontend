import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import Tooltip from "react-bootstrap/Tooltip";
import Overlay from "react-bootstrap/Overlay";
import ClueList from "./ClueList";
import { Clue, ClueDirection } from "./model/Clue";
import { GridEntry } from "./model/GridEntry";
import { Puzzle, toIndex } from "./model/Puzzle";
import { getExplanation, getSolutions } from "./utils";
import Button from "@mui/material/Button";
import SplitButton from "../SplitButton";
import Hide from "../Hide";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { SolutionMenu } from "./SolutionMenu";

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
  // TODO: Add multiple-solution handling.
  const [solveWithGrid, setSolveWithGrid] = useState(true);
  const [solutions, setSolutions] = useState<Array<string>>();
  const [explanation, setExplanation] = useState<string>();
  const [solveOverlayText, setSolveOverlayText] = useState<string>();
  const solveOverlayTarget = useRef(null);
  const solutionMenuTarget = useRef(null);

  const [solveCancelToken, setSolveCancelToken] = useState(
    new AbortController()
  );
  const [cancelSolveGrid, setCancelSolveGrid] = useState(false);
  const [gridContinuation, setGridContinuation] = useState<number>();

  useEffect(() => {
    if (puzzle) {
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
  }

  function getClueText(clue: Clue): string {
    return clue
      .generateVertices()
      .map((v) => entries[toIndex(puzzle, v.x, v.y)].content || "_")
      .join("");
  }

  function setClueText(clue: Clue, text: string) {
    let k = 0;
    clue
      .generateVertices()
      .forEach((xy) => updateGrid(xy, { content: text[k++]?.toUpperCase() }));
  }

  function clearClueText(clue: Clue) {
    setClueText(clue, "");
  }

  // Cancels the current clue solve request.
  function cancelSolveClue() {
    solveCancelToken.abort();
    setSolveCancelToken(new AbortController());
    setLoadingSolution(false);
  }

  // Calls the solver and fills in the given clue on the grid.
  async function solveClue(clue: Clue): Promise<boolean> {
    setSolveOverlayText(undefined);
    setLoadingSolution(true);
    try {
      // Strip html tags and word length brackets from clue.
      const strippedClue = clue.getClueText();
      const solutions = await getSolutions(
        strippedClue,
        clue.totalLength,
        solveCancelToken.signal
      );
      if (solutions.length > 0 && solutions[0].length == clue.totalLength) {
        if (solutions.length > 1) {
          setSolutions(solutions);
          setLoadingSolution(false);
          return true;
        } else {
          setClueText(clue, solutions[0]);
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

  async function explainAnswer(clue: Clue) {
    const answer = getClueText(clue).toLowerCase();
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
    setGridContinuation(undefined);
    setCancelSolveGrid(false);
    setCurrentCell(undefined);
    for (let i = startIndex; i < puzzle.clues.length; i++) {
      if (cancelSolveGrid) {
        break;
      }

      const clue = puzzle.clues[i];
      setSelectedClue(clue);
      const multiSolutions = await solveClue(clue);
      if (multiSolutions) {
        setGridContinuation(startIndex + 1);
        break;
      }
    }

    setGridContinuation(undefined);
    setSolveOverlayText(undefined);
  }

  async function onSolutionSelected(solution: string) {
    setSolutions(undefined);

    if (selectedClue) {
      setClueText(selectedClue, solution);

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
        <>
          <div className="d-flex flex-column p-2">
            <div className="crossword-svg-container">
              <svg
                width={svgWidth}
                height={svgHeight}
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
              <Button
                ref={solutionMenuTarget}
                variant="contained"
                color="primary"
                className="me-2"
                disabled={loadingSolution}
                onClick={async () => await solveAllClues()}
              >
                Solve Grid
              </Button>
              <Button
                className="me-2"
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
                      ]}
                      onClick={async (index, _) => {
                        if (index == 0) {
                          await solveClue(selectedClue);
                        } else if (index == 1) {
                          await explainAnswer(selectedClue);
                        }
                      }}
                      cypressData="solve-cell"
                    />
                  </Hide>
                  {loadingSolution && (
                    <Button
                      className="me-2"
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        setCancelSolveGrid(true);
                        cancelSolveClue();
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    className="ms-2"
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
          </div>
          <div className="d-flex flex-column">
            <div
              className="d-flex flex-row"
              style={{ justifyContent: "space-around" }}
            >
              <ClueList
                clues={puzzle.clues.filter(
                  (c) => c.direction == ClueDirection.Across
                )}
                title="Across"
                onClueClicked={onClueSelectedFromList}
                selectedClue={selectedClue}
              />
              <ClueList
                clues={puzzle.clues.filter(
                  (c) => c.direction == ClueDirection.Down
                )}
                title="Down"
                onClueClicked={onClueSelectedFromList}
                selectedClue={selectedClue}
              />
            </div>
          </div>
        </>
      )}
      <SolutionMenu
        solutions={solutions}
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
