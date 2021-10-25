import { Clue } from "./Clue";

export interface Puzzle {
    clues: Clue[];
    rows: number;
    columns: number;
}