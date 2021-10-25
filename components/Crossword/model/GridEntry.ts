import { Clue } from "./Clue";

export class GridEntry {
    editable: boolean = true;
    content?: string;
    user: boolean = false;
    clues: Clue[] = [];
    clueStarts: Clue[] = [];
    x: number = -1;
    y: number = -1;
  
    positionEquals(entry?: GridEntry): boolean {
      return entry ? entry.x == this.x && entry.y == this.y : false;
    }
  }