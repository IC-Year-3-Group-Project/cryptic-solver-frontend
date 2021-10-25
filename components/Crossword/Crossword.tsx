import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Tooltip";
import Overlay from "react-bootstrap/Overlay";
import ClueList from "./ClueList";
import { Clue, ClueDirection } from "./model/Clue";
import { GridEntry } from "./model/GridEntry";
import { Puzzle } from "./model/Puzzle";
import { getSolutions } from "./utils";

export function convertEveryman(crossword: any): Puzzle {
  const clues = crossword.entries.map((entry: any) => {
    const data = {
      number: entry.number,
      direction: entry.direction == "across" ? ClueDirection.Across : ClueDirection.Down,
      text: entry.clue,
      totalLength: entry.length,
      lengths: /\((.*)\)/g.exec(entry.clue)![1].replace("-", ",").split(",").map(len => +len),
      x: entry.position.x,
      y: entry.position.y
    };
    const clue = new Clue();
    Object.assign(clue, data);
    return clue;
  });

  return {
    clues: clues,
    rows: crossword.dimensions.rows,
    columns: crossword.dimensions.cols
  };
}

export interface CrosswordProps {
  puzzle: Puzzle;
  cellWidth: number;
  cellHeight: number;
}

const AllowedCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BackspaceKey = "Backspace";
const LeftKey = "ArrowLeft";
const RightKey = "ArrowRight";
const UpKey = "ArrowUp";
const DownKey = "ArrowDown";

const KeyDirections: { [key: string]: { direction: ClueDirection, back: boolean } } = {
  [LeftKey]: { direction: ClueDirection.Across, back: true },
  [RightKey]: { direction: ClueDirection.Across, back: false },
  [UpKey]: { direction: ClueDirection.Down, back: true },
  [DownKey]: { direction: ClueDirection.Down, back: false },
};

export const ClueSelectionColour = "#FFF7B2";
export const CellSelectionColour = "#FFE500";


export default function Crossword(props: CrosswordProps) {
  const { puzzle, cellWidth, cellHeight } = props;

  const [entries, setEntries] = useState<Array<GridEntry>>([]);
  const [selectedClue, setSelectedClue] = useState<Clue>();
  const [currentCell, setCurrentCell] = useState<GridEntry>();
  const [lastCell, setLastCell] = useState<GridEntry>();
  const [input, setInput] = useState<HTMLInputElement>();

  const [loadingSolution, setLoadingSolution] = useState(false);
  const [loadingExplaination, setLoadingExplanation] = useState(false);
  const [solutions, setSolutions] = useState<Array<string>>([]);
  const [solveOverlayText, setSolveOverlayText] = useState<string>();
  const solveOverlayTarget = useRef(null);

  useEffect(() => {
    if (puzzle) {
      const newEntries = new Array<GridEntry>();
      const clueMap: { [key: string]: Clue[] } = {};
      // Build x,y -> clue mapping.
      puzzle.clues.forEach(clue => {
        const xMax = clue.direction == ClueDirection.Across ? clue.x + clue.totalLength : clue.x + 1;
        const yMax = clue.direction == ClueDirection.Down ? clue.y + clue.totalLength : clue.y + 1;
        for (let x = clue.x; x < xMax; x++) {
          for (let y = clue.y; y < yMax; y++) {
            let map = clueMap[`${x},${y}`];
            if (!map) {
              clueMap[`${x},${y}`] = map = [];
            }
            map.push(clue);
          }
        }
      });

      for (let y = 0; y < puzzle.rows; y++) {
        for (let x = 0; x < puzzle.columns; x++) {
          const clues = clueMap[`${x},${y}`] || [];
          const entry = new GridEntry();
          entry.editable = clues.length > 0;
          entry.user = false;
          entry.clues = clues;
          entry.clueStarts = clues.filter(c => c.x == x && c.y == y);
          entry.x = x;
          entry.y = y;
          newEntries.push(entry);
        }
      }

      setEntries(newEntries);
    }
  }, [puzzle]);

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

  function updateGrid(cell: { x: number, y: number }, updated: any) {
    const index = entries.findIndex(c => c.x == cell.x && c.y == cell.y);
    const copy = [...entries];
    copy[index] = Object.assign(entries[index], updated);
    setEntries(copy);
  }

  function travel(fromX: number, fromY: number, direction: ClueDirection, back: boolean = false): GridEntry | undefined {
    const diff = back ? -1 : 1;
    const nextCellX = direction == ClueDirection.Across ? fromX + diff : fromX;
    const nextCellY = direction == ClueDirection.Down ? fromY + diff : fromY;
    const nextCell = nextCellX >= 0 && nextCellX < puzzle.columns && nextCellY >= 0 && nextCellY < puzzle.rows ? entries.filter(c => c.x == nextCellX && c.y == nextCellY) : [];
    return nextCell.length > 0 ? nextCell[0] : undefined;
  }

  function onCellKeyUp(event: KeyboardEvent) {
    if (currentCell && selectedClue) {
      if (event.code == BackspaceKey) {
        if (currentCell.content) {
          updateGrid(currentCell, { content: undefined });
        } else {
          const nextCell = travel(currentCell.x, currentCell.y, selectedClue.direction, true);
          if (nextCell) {
            onCellClick(nextCell, true);
          }
        }
      } else if (KeyDirections[event.code]) {
        const move = KeyDirections[event.code];
        const nextCell = travel(currentCell.x, currentCell.y, move.direction, move.back);
        if (nextCell) {
          onCellClick(nextCell, nextCell.clues.length > 1);
        }
      }
    }
  }

  function onCellValueEntered(value: string) {
    if (value?.length > 0  && selectedClue && currentCell && AllowedCharacters.includes(value)) {
      updateGrid(currentCell, { content: value.toUpperCase() });
      const nextCell = travel(currentCell.x, currentCell.y, selectedClue.direction);
      if (nextCell) {
        onCellClick(nextCell, true);
      }
    }
  }

  function onCellClick(cell: GridEntry | undefined, force: boolean = false) {
    setSolveOverlayText(undefined);

    if (!cell) {
      setLastCell(undefined);
      setCurrentCell(undefined);
      setSelectedClue(undefined);
      return;
    }

    if (cell.clues.length == 0) {
      return;
    }

    if (!force) {
      if (cell.positionEquals(lastCell) && selectedClue && cell.clues.length > 1) {
        setSelectedClue(cell.clues.filter(c => c.direction != selectedClue.direction)[0]);
      } else {
        const clueCandiadates = selectedClue
          ? [...cell.clues.filter(c => c.direction == selectedClue.direction), ...cell.clues]
          : (cell.clueStarts.length == 0 ? cell.clues : cell.clueStarts);
        setSelectedClue(clueCandiadates[0]);
      }
    }

    setLastCell(currentCell || cell);
    setCurrentCell(cell);
  }

  function onClueSelectedFromList(clue: Clue) {
    const cells = entries.filter(e => clue.x == e.x && clue.y == e.y);
    if (cells.length > 0) {
      setCurrentCell(cells[0]);
      setSelectedClue(clue);
    }
    setSolveOverlayText(undefined);
  }

  async function solveClue(clue: Clue) {
    setSolveOverlayText(undefined);
    if (clue) {
      setLoadingSolution(true);
      try {
        const vertices = clue.generateVertices();
        const solutionLength = clue.totalLength;
        // Strip html tags and word lengths from clue.
        const strippedClue = clue.text.replace(/<[^>]*>?/gm, "").replace(/\(.*\)$/g, "").trim();
        const solutions = await getSolutions(strippedClue, solutionLength);
        if (solutions.length > 0 && solutions[0].length == solutionLength) {
          let k = 0;
          vertices.forEach(xy => updateGrid(xy, { content: solutions[0][k++].toUpperCase() }))
        } else {
          setSolveOverlayText("No solutions found.");
        }
      } catch (ex) {
        console.log("Error loading solutions", ex);
        setSolveOverlayText("Error fetching solutions.");
      }
      setLoadingSolution(false);
    }
  }

  async function trySolveAll() {
    setCurrentCell(undefined);
    for (const clue of puzzle.clues) {
      setSelectedClue(clue);
      await solveClue(clue);
    }
    setSolveOverlayText(undefined);
  }

  const svgWidth = cellWidth * puzzle.columns;
  const svgHeight = cellHeight * puzzle.rows;

  return (
  <div style={{display: "flex", flexDirection: "row", flexWrap: "wrap", flexBasis: "auto", flexGrow: 1, width: "110%"}}>
    {puzzle && <>
      <div style={{display: "flex", flex: "0 0 0", flexDirection: "column"}} ref={solveOverlayTarget}>
        <div style={{clear: "both", position: "relative", minWidth: `${svgWidth}px`, minHeight: `${svgHeight}px`}}>
          <div style={{float: "left"}}>
            <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
              <rect width={svgWidth} height={svgHeight} color="black"></rect>
              {entries.map((cell, index) => {
                if (!cell.editable) {
                  return;
                }

                const xPos = cell.x * cellWidth;
                const yPos = cell.y * cellHeight;
                return (<g key={index} onClick={() => onCellClick(cell)}>
                  <rect x={xPos + 1} y={yPos + 1} width={cellWidth - 2} height={cellHeight - 2} fill="#FFFFFF"></rect>
                  {selectedClue && selectedClue.contains(cell.x, cell.y) && <rect x={xPos + 1} y={yPos + 1} width={cellWidth - 2} height={cellHeight - 2} fill={ClueSelectionColour}></rect>}
                  {cell.clueStarts?.length > 0 && <text x={xPos + 2} y={yPos + 10} fontSize="0.625rem">{cell.clueStarts[0].number}</text>}
                  {cell.content && !cell.positionEquals(currentCell) && <text x={xPos + cellWidth / 2} y={yPos + cellHeight / 1.4} fontSize="1rem" textAnchor="middle">{cell.content}</text>}
                  {cell.positionEquals(currentCell) && <rect x={xPos + 1} y={yPos + 1} width={cellWidth - 2} height={cellHeight - 2} style={{fill: "#00000000", strokeWidth: 2, stroke: CellSelectionColour}}></rect>}
                </g>)
              })}
            </svg>
            {currentCell &&
            <div style={{position: "absolute", left: `${currentCell.x * cellWidth}px`, top: `${currentCell.y * cellHeight}px`, width: `${cellHeight}px`, height: `${cellHeight}px`}}>
              <input onClick={() => onCellClick(currentCell)} type="text" maxLength={1} autoComplete="off" autoCorrect="off" spellCheck={false} style={{
                width: "100%",
                height: "100%",
                textAnchor: "middle",
                textAlign: "center",
                fontWeight: "bold",
                padding: 0,
                border: 0,
                backgroundColor: "transparent"}}
                onChange={e => onCellValueEntered(e.target.value)}
                onKeyUp={onCellKeyUp}
                value={currentCell.content ?? ""}
                ref={ref => ref && setInput(ref)}>
              </input>
            </div>}
          </div>
        </div>
        <div style={{display: "flex", flexDirection: "row", paddingTop: "1rem"}}>
          <Button size="sm" className="me-2" disabled={loadingSolution} onClick={trySolveAll}>Solve Grid</Button>
          {selectedClue && <>
          <Button size="sm" className="me-2" disabled={loadingSolution} onClick={async () => solveClue(selectedClue)}>{loadingSolution ? "Solving..." : `Solve ${selectedClue.number} ${ClueDirection[selectedClue.direction]}`}</Button>
          <Button size="sm" disabled={loadingExplaination}>{loadingExplaination ? "Explaining..." : `Explain ${selectedClue.number} ${ClueDirection[selectedClue.direction]}`}</Button>
          <Overlay target={solveOverlayTarget.current} show={solveOverlayText != undefined} placement="top">
            {(props) => (
              <Tooltip {...props}>
                {solveOverlayText}
              </Tooltip>
            )}
          </Overlay>
          </>}
        </div>
      </div>
      <ClueList clues={puzzle.clues.filter(c => c.direction == ClueDirection.Across)} title="Across" onClueClicked={onClueSelectedFromList} selectedClue={selectedClue}/>
      <ClueList clues={puzzle.clues.filter(c => c.direction == ClueDirection.Down)} title="Down"onClueClicked={onClueSelectedFromList}  selectedClue={selectedClue}/>
      </>}
  </div>);
}
