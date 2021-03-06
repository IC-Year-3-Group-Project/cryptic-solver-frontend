import { Clue } from "./model/Clue";
import { GridEntry } from "./model/GridEntry";
import { Puzzle, toIndex } from "./model/Puzzle";
import {
  delay,
  getExplainedSolutions,
  getUnlikelySolutions,
  Solution,
  solveWithPattern,
  solveWithPatternUnlikely,
} from "./utils";

export const DefaultBacktrackingOptions: BacktrackingOptions = {
  useHaskellBase: true,
  useHaskellPartial: true,
  triggerUpdateOnClear: false,
  maxSolutionRetries: 0,
  bestGridOnFailure: true,
  bestGridByCells: false,
  useStaticCache: true,
  delayBetweenInsert: true,
};

export interface BacktrackingOptions {
  useHaskellBase: boolean;
  useHaskellPartial: boolean;
  triggerUpdateOnClear: boolean;
  maxSolutionRetries: number;
  bestGridOnFailure: boolean;
  bestGridByCells: boolean;
  timeout?: number;
  useStaticCache: boolean;
  delayBetweenInsert: boolean;
}

export class Backtracker {
  puzzle: Puzzle;
  entries: GridEntry[];
  options: BacktrackingOptions = DefaultBacktrackingOptions;
  solutions: { [key: string]: Solution[] } = {};
  onUpdate?: (clue: Clue, answer: string) => void;
  onSolveCountUpdate?: (count: number) => void;
  setCache?: (clue: Clue, solutions: Solution[]) => void;
  setSolving?: (clue: Clue) => void;

  private cancel: boolean = false;
  private abortSignal!: AbortController;

  private bestGrid: Partial<GridEntry>[] = [];
  private cellsSolved: number = 0;
  private bestCellsSolved: number = 0;

  get cancelled(): boolean {
    return this.cancel;
  }

  get bestGridContent(): Partial<GridEntry>[] {
    return this.options.bestGridOnFailure ? this.bestGrid : [];
  }

  constructor(
    puzzle: Puzzle,
    entries: GridEntry[],
    onUpdate?: (clue: Clue, answer: string) => void,
    onSolveCountUpdate?: (count: number) => void,
    setCache?: (clue: Clue, solutions: Solution[]) => void,
    setSolving?: (clue: Clue) => void,
    solutions?: { [key: string]: Solution[] }
  ) {
    this.puzzle = puzzle;
    this.entries = entries.map((e) => Object.assign(new GridEntry(), e));
    this.onUpdate = onUpdate;
    this.onSolveCountUpdate = onSolveCountUpdate;
    this.setCache = setCache;
    this.setSolving = setSolving;
    this.solutions = solutions ?? {};
  }

  private getExistingPattern(clue: Clue): string | undefined {
    let undef = true;
    const pattern = clue
      .generateVertices()
      .map((v) => {
        const content = this.entries[toIndex(this.puzzle, v.x, v.y)].content;
        if (content) {
          undef = false;
        }

        return content || "?";
      })
      .join("");
    return undef ? undefined : pattern;
  }

  private setClueText(clue: Clue, text: string): string {
    let old = "";
    clue.generateVertices().forEach((v, i) => {
      const entry = this.entries[toIndex(this.puzzle, v.x, v.y)];
      old += entry.content || "?";
      entry.content = text[i] == "?" ? undefined : text[i];
    });

    return old;
  }

  private fits(clue: Clue, answer: string): boolean {
    return (
      clue.totalLength == answer.length &&
      !clue.generateVertices().some((v, i) => {
        const content = this.entries[toIndex(this.puzzle, v.x, v.y)].content;
        return content && content != answer[i];
      })
    );
  }

  private async getSolutions(
    clue: Clue,
    pattern?: string,
    currentRetry?: number
  ): Promise<Solution[]> {
    const cacheKey = `${clue.getTitle()}:${pattern || "_base_"}`;
    let solutions = this.solutions[cacheKey];

    let accumKey = `${clue.getTitle()}:_accum_`;
    if (!this.solutions[accumKey]) {
      this.solutions[accumKey] = [];
    }

    if (pattern) {
      const baseSolutions = this.solutions[accumKey].filter(
        (s) =>
          ![...s.strippedAnswer].some(
            (c, i) => pattern[i] != "?" && c != pattern[i]
          )
      );

      if (baseSolutions.length > 0) {
        return baseSolutions;
      }
    }
    if (!solutions) {
      try {
        solutions = this.solutions[cacheKey] = pattern
          ? await (this.options.useHaskellPartial
              ? solveWithPattern
              : solveWithPatternUnlikely)(
              clue.getClueText(),
              clue.totalLength,
              clue.getSolutionPattern(),
              pattern,
              this.abortSignal.signal
            )
          : await (this.options.useHaskellBase
              ? getExplainedSolutions
              : getUnlikelySolutions)(
              clue.getClueText(),
              clue.totalLength,
              clue.getSolutionPattern(),
              this.abortSignal.signal
            );
        solutions.sort((s0, s1) => s1.confidence - s0.confidence);
        this.solutions[accumKey] = [
          ...this.solutions[accumKey],
          ...solutions,
        ].filter((s, i, arr) => arr.indexOf(s) == i);
        if (this.setCache) {
          this.setCache(clue, solutions);
        }
      } catch (ex: any) {
        if (
          !ex.message?.includes("aborted") &&
          (currentRetry ?? 0) < this.options.maxSolutionRetries
        ) {
          // retry on server error.
          return await this.getSolutions(
            clue,
            pattern,
            (currentRetry ?? 0) + 1
          );
        }
        return [];
      }
    }

    return solutions;
  }

  cancelSolve() {
    this.cancel = true;
    this.abortSignal.abort();
  }

  async solveAll(): Promise<boolean> {
    if (!this.options.useStaticCache) {
      this.solutions = {};
    }

    this.cancel = false;
    this.abortSignal = new AbortController();
    if (this.options.timeout && this.options.timeout > 0) {
      setTimeout(() => {
        this.cancelSolve();
      }, this.options.timeout * 1000);
    }
    const clues = [...this.puzzle.clues];
    for (let retries = 0; retries < clues.length; retries++) {
      if (await this.backtrack(clues)) {
        return true;
      }
    }

    return false;
  }

  async backtrack(clues: Clue[]) {
    if (this.onSolveCountUpdate) {
      this.onSolveCountUpdate(this.puzzle.clues.length - clues.length);
    }

    if (clues.length == 0) {
      return true;
    }

    const clue = clues[0];
    if (this.setSolving) {
      this.setSolving(clue);
    }

    const pattern = this.getExistingPattern(clue);
    const solutions = await this.getSolutions(clue, pattern);

    clues.shift();
    for (let solution of solutions.filter((s) =>
      this.fits(clue, s.strippedAnswer)
    )) {
      // Try solution for clue.
      const old = this.setClueText(clue, solution.strippedAnswer);
      if (this.onUpdate) {
        this.onUpdate(clue, solution.strippedAnswer);
      }

      const solveScore = this.options.bestGridByCells ? clue.totalLength : 1;
      this.cellsSolved += solveScore;

      if (this.cellsSolved > this.bestCellsSolved) {
        this.bestGrid = [...this.entries.map((e) => ({ content: e.content }))];
        this.bestCellsSolved = this.cellsSolved;
      }

      if (this.options.delayBetweenInsert) {
        await delay(1);
      }

      if (await this.backtrack(clues)) {
        return true;
      }

      // Undo change
      this.cellsSolved -= solveScore;
      this.setClueText(clue, old);
      if (this.options.triggerUpdateOnClear && this.onUpdate) {
        this.onUpdate(clue, old.replaceAll("?", "_"));
      }

      if (this.cancel) {
        return false;
      }
    }

    clues.push(clue);
    return false;
  }
}
