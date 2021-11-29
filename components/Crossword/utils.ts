import { Clue, ClueDirection } from "./model/Clue";
import { Puzzle } from "./model/Puzzle";

export const apiUrl = "https://cryptic-solver-backend.herokuapp.com";

/** Performs a post request sending the given data as json to the given endpoint. */
async function post<T>(
  endpoint: string,
  data: any,
  cancellation?: AbortSignal
): Promise<T> {
  const response = await fetch(`${apiUrl}${endpoint}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    signal: cancellation,
  });

  const json = await response.json();
  return json as T;
}

/** Performs a get request to the given endpoint. */
async function get<T>(endpoint: string, cancellation?: AbortSignal) {
  const response = await fetch(`${apiUrl}${endpoint}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal: cancellation,
  });

  const json = await response.json();
  return json as T;
}

/** Gets and parses the data for a crossword at the given url. */
export function getCrossword(url: string): Promise<any> {
  return post("/fetch-crossword", { url });
}

/** Gets possible solutions returns from the solver given a clue. */
export function getSolutions(
  clue: string,
  word_length: number,
  cancellation?: AbortSignal
): Promise<any> {
  return post("/solve-clue", { clue, word_length }, cancellation);
}

/** Gets explanations linking a clue and its solution. */
export function getExplanation(
  clue: string,
  answer: string,
  cancellation?: AbortSignal
): Promise<string> {
  return post(
    "/explain_answer",
    { clue, answer, word_length: answer.length },
    cancellation
  );
}

export async function getExplainedSolutions(
  clue: string,
  word_length: number,
  pattern: string,
  cancellation?: AbortSignal
): Promise<Array<Solution>> {
  const results = await post<Array<any>>(
    "/solve-and-explain",
    { clue, word_length, pattern },
    cancellation
  );
  return results.map((r) => Object.assign(new Solution(), r));
}

export async function getUnlikelySolutions(
  clue: string,
  word_length: number,
  pattern: string,
  cancellation?: AbortSignal
): Promise<Array<Solution>> {
  return (
    await post<Array<Solution>>(
      "/unlikely-solve-clue",
      { clue, word_length, pattern },
      cancellation
    )
  ).map((s) => Object.assign(new Solution(), s));
}

export async function solveWithPattern(
  clue: string,
  word_length: number,
  pattern: string,
  letter_pattern: string,
  cancellation?: AbortSignal
): Promise<Array<Solution>> {
  return (
    await post<Array<Solution>>(
      "/solve-with-pattern",
      { clue, word_length, pattern, letter_pattern },
      cancellation
    )
  ).map((s) => Object.assign(new Solution(), s));
}

export async function solveWithPatternUnlikely(
  clue: string,
  word_length: number,
  pattern: string,
  letter_pattern: string,
  cancellation?: AbortSignal
): Promise<Array<Solution>> {
  return (
    await post<Array<Solution>>(
      "/solve-with-pattern-unlikely",
      { clue, word_length, pattern, letter_pattern },
      cancellation
    )
  ).map((s) => Object.assign(new Solution(), s));
}

/** Calls the backend to process 3 puzzle images (grid, across, down clues). */
export function processPuzzle(
  grid: string,
  across: string,
  down: string,
  cancellation?: AbortSignal
): Promise<CrosswordUploadResponse> {
  return post(
    "/process-puzzle",
    {
      mobile: false,
      grid,
      across,
      down,
    },
    cancellation
  );
}

/** Gets a puzzle by its id. */
export function getPuzzleById(
  id: number,
  cancellation?: AbortSignal
): Promise<{ grid: Puzzle }> {
  return post<{ grid: Puzzle }>("/get-puzzle", { id }, cancellation);
}

/** Gets everyman crossword urls. */
export function getEveryman(
  cancellation?: AbortSignal
): Promise<{ urls: string[] }> {
  return get<{ urls: string[] }>("/fetch-everyman", cancellation);
}

export function convertEveryman(crossword: any): Puzzle {
  const clues = crossword.entries.map((entry: any) => {
    const data = {
      number: entry.number,
      direction:
        entry.direction == "across" ? ClueDirection.Across : ClueDirection.Down,
      text: entry.clue,
      totalLength: entry.length,
      lengths: /\((.*)\)/g
        .exec(entry.clue)![1]
        .replace("-", ",")
        .split(",")
        .map((len) => +len),
      x: entry.position.x,
      y: entry.position.y,
      solution: entry.solution,
    };
    const clue = new Clue();
    Object.assign(clue, data);
    return clue;
  });

  return {
    clues: clues,
    rows: crossword.dimensions.rows,
    columns: crossword.dimensions.cols,
  };
}

function toHex(component: number) {
  const hex = component.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex({ r, g, b }: RGB): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function gradient(
  points: RGB[],
  interp: number,
  func: (x: number) => number
): RGB {
  const interpRange = 1 / (points.length - 1);
  if (interp <= 0) {
    return points[0];
  }

  if (interp >= 1) {
    return points[points.length - 1];
  }

  for (let i = 0; i < points.length - 1; i++) {
    const interpStart = interpRange * i;
    const interpEnd = interpRange * (i + 1);
    if (interp < interpEnd) {
      interp = func((interp - interpStart) / interpRange);
      const p0 = points[i];
      const p1 = points[i + 1];
      return {
        r: Math.round(p0.r + (p1.r - p0.r) * interp),
        g: Math.round(p0.g + (p1.g - p0.g) * interp),
        b: Math.round(p0.b + (p1.b - p0.b) * interp),
      };
    }
  }

  return points[0];
}

/* Adds Clue methods to partial clue objects. */
export function classify(crossword: any): Puzzle {
  if (crossword.clues) {
    crossword.clues = (crossword.clues as Partial<Clue>[]).map((c) =>
      Object.assign(new Clue(), c)
    );
  }

  return crossword as Puzzle;
}

export function stripSolution(solution: string): string {
  return solution.replaceAll(/[^A-z]/g, "");
}

export interface CrosswordUploadResponse {
  id: number;
  grid: Puzzle;
}

export class Solution {
  answer: string = "";
  confidence: number = 0;
  explanation: string = "";
  hintLevel: number = 0;

  get strippedAnswer(): string {
    return stripSolution(this.answer).toUpperCase();
  }
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}
