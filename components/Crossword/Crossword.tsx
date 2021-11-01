import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Tooltip";
import Overlay from "react-bootstrap/Overlay";
import ClueList from "./ClueList";
import { Clue, ClueDirection } from "./model/Clue";
import { GridEntry } from "./model/GridEntry";
import { Puzzle, toIndex } from "./model/Puzzle";
import { getSolutions } from "./utils";
import Dialog from "@material-ui/core/Dialog";
import { DialogTitle } from "@mui/material";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import MaterialButton from "@material-ui/core/Button";

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
  // TODO: Add explanation loading and multiple-solution handling.
  const [loadingExplaination, setLoadingExplanation] = useState(false);
  const [solutions, setSolutions] = useState<Array<string>>([]);
  const [solveOverlayText, setSolveOverlayText] = useState<string>();
  const solveOverlayTarget = useRef(null);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editClueText, setEditClueText] = useState("");
  const [editClueError, setEditClueError] = useState<string>();

  const [solveCancelToken, setSolveCancelToken] = useState(
    new AbortController()
  );
  const [cancelSolveGrid, setCancelSolveGrid] = useState(false);

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

  // Permafocus crossword input.
  useEffect(() => {
    if (input) {
      function hideOnUnfocus() {
        input?.focus();
      }

      input.focus();
      input.addEventListener("focusout", hideOnUnfocus);
      return () => input.removeEventListener("focusout", hideOnUnfocus);
    }
  }, [input]);

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
  async function solveClue(clue: Clue) {
    setSolveOverlayText(undefined);
    setLoadingSolution(true);
    try {
      // Strip html tags and word length brackets from clue.
      const strippedClue = clue.getRawText().replace(/\(.*\)$/g, "");
      const solutions = await getSolutions(
        strippedClue,
        clue.totalLength,
        solveCancelToken.signal
      );
      // TODO: Handle multiple solutions (give user choice maybe).
      if (solutions.length > 0 && solutions[0].length == clue.totalLength) {
        setClueText(clue, solutions[0]);
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
  }

  // Loops through clues and calls the solver on all of them, filling in the grid along the way.
  async function trySolveAll() {
    setCancelSolveGrid(false);
    setCurrentCell(undefined);
    for (const clue of puzzle.clues) {
      if (cancelSolveGrid) {
        break;
      }

      setSelectedClue(clue);
      await solveClue(clue);
    }

    setSolveOverlayText(undefined);
  }

  function saveClueEdits() {
    const trimmed = editClueText.trim();
    if (trimmed.length == 0) {
      setEditClueError("Please enter a clue.");
    } else if (selectedClue) {
      selectedClue.text = trimmed;
      setShowEditDialog(false);
    }
  }

  const svgWidth = cellWidth * puzzle.columns;
  const svgHeight = cellHeight * puzzle.rows;
  return (
    <div className="crossword-container">
      {puzzle && (
        <>
          <div className="d-flex flex-column">
            <div className="crossword-svg-container">
              <div className="float-left">
                <svg
                  width={svgWidth}
                  height={svgHeight}
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                >
                  <rect
                    width={svgWidth}
                    height={svgHeight}
                    color="black"
                  ></rect>
                  {entries
                    .filter((cell) => cell.editable)
                    .map((cell, index) => {
                      const [xPos, yPos] = [
                        cell.x * cellWidth,
                        cell.y * cellHeight,
                      ];
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
                            <text
                              x={xPos + 2}
                              y={yPos + 10}
                              fontSize="0.625rem"
                            >
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
                </svg>
                {currentCell && (
                  <div
                    style={{
                      position: "absolute",
                      left: currentCell.x * cellWidth,
                      top: currentCell.y * cellHeight,
                      width: cellWidth,
                      height: cellHeight,
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
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                paddingTop: "1rem",
              }}
            >
              <Button
                size="sm"
                className="me-2"
                disabled={loadingSolution}
                onClick={trySolveAll}
              >
                Solve Grid
              </Button>
              <Button
                size="sm"
                className="me-2"
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
                  <Button
                    size="sm"
                    className="me-2"
                    onClick={async () => {
                      if (loadingSolution) {
                        setCancelSolveGrid(true);
                        cancelSolveClue();
                      } else {
                        await solveClue(selectedClue);
                      }
                    }}
                    data-cy="solve-cell"
                  >
                    {loadingSolution
                      ? "Cancel"
                      : `Solve ${selectedClue.number} ${
                          ClueDirection[selectedClue.direction]
                        }`}
                  </Button>
                  <Button
                    size="sm"
                    className="me-2"
                    disabled={loadingExplaination}
                  >
                    {loadingExplaination
                      ? "Explaining..."
                      : `Explain ${selectedClue.number} ${
                          ClueDirection[selectedClue.direction]
                        }`}
                  </Button>
                  <Button
                    size="sm"
                    className="me-2"
                    onClick={() => {
                      setEditClueError(undefined);
                      setEditClueText(selectedClue.getRawText());
                      setShowEditDialog(true);
                    }}
                  >
                    Edit Clue
                  </Button>
                  <Button
                    size="sm"
                    className="me-2"
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
          <Dialog open={showEditDialog} fullWidth maxWidth="sm">
            <DialogTitle>Edit Clue</DialogTitle>
            <DialogContent>
              <TextField
                onChange={(e) => setEditClueText(e.target.value)}
                value={editClueText}
                error={editClueError != undefined}
                helperText={editClueError}
                fullWidth
                multiline
              />
            </DialogContent>
            <DialogActions>
              <MaterialButton onClick={() => setShowEditDialog(false)}>
                Cancel
              </MaterialButton>
              <MaterialButton onClick={saveClueEdits}>Save</MaterialButton>
            </DialogActions>
          </Dialog>
        </>
      )}
    </div>
  );
}
