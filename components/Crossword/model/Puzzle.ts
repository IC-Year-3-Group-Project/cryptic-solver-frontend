import { Clue } from "./Clue";

export interface Puzzle {
  clues: Clue[];
  rows: number;
  columns: number;
}

export function toIndex(puzzle: Puzzle, x: number, y: number): number {
  return x + y * puzzle.columns;
}
