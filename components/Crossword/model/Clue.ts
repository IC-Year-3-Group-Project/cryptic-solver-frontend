export class Clue {
  number: number = -1;
  direction: ClueDirection = ClueDirection.None;
  text: string = "";
  totalLength: number = 0;
  lengths: number[] = [];
  x: number = -1;
  y: number = -1;

  contains(x: number, y: number) {
    if (this.direction == ClueDirection.Across) {
      return x >= this.x && x < this.x + this.totalLength && y == this.y;
    } else if (this.direction == ClueDirection.Down) {
      return y >= this.y && y < this.y + this.totalLength && x == this.x;
    }

    return false;
  }

  generateVertices(): Array<{ x: number; y: number }> {
    if (this.direction == ClueDirection.Across) {
      return [...Array(this.totalLength).keys()].map((i) => ({
        x: this.x + i,
        y: this.y,
      }));
    } else if (this.direction == ClueDirection.Down) {
      return [...Array(this.totalLength).keys()].map((i) => ({
        x: this.x,
        y: this.y + i,
      }));
    }

    return [];
  }

  /* Gets the display name of the clue (e.g. "4-Down"). */
  getTitle(): string {
    return `${this.number}: ${ClueDirection[this.direction]}`;
  }

  /* Returns the text of the clue with HTML tags stripped. */
  getRawText(): string {
    return this.text.replace(/<[^>]*>?/gm, "").trim();
  }

  /* Returns the text of the clue with HTML tags and word lengths stripped. */
  getClueText(): string {
    return this.getRawText()
      .replace(/\(.*\)$/g, "")
      .trim();
  }

  getBreakLengths(): number[] {
    let accum = 0;
    const breaks = this.lengths.map((l) => (accum += l));
    breaks.pop();
    return breaks;
  }

  isHorizontalWordBreak(x: number, y: number): boolean {
    return this.getBreakLengths().some((l) => l == x - this.x + 1);
  }

  isVerticalWordBreak(x: number, y: number): boolean {
    return this.getBreakLengths().some((l) => l == y - this.y + 1);
  }
}

export enum ClueDirection {
  None = -1,
  Across = 0,
  Down = 1,
}
