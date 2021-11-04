import { Clue, ClueDirection } from "../Crossword/model/Clue";
import { Puzzle } from "../Crossword/model/Puzzle";

export function preprocess(text: string) {
  // Preprocess weird characters
  let character_replacements = new Map([
    [/©/g, "(5)"],
    [/\|/g, "I"],
    [/®/g, "(5"],
    [/@/g, "(7)"],
  ]);

  character_replacements.forEach((replacement, key) => {
    text = text.replace(key, replacement);
  });

  // Take care of cases where the lengths of a two-word clue have been stuck together
  for (let i = 0; i < text.length - 2; i++) {
    if (
      text.charAt(i) == "(" &&
      text.charAt(i + 1) > "1" &&
      text.charAt(i + 1) <= "9" &&
      text.charAt(i + 2) >= "1" &&
      text.charAt(i + 2) <= "9"
    ) {
      text =
        text.substring(0, i + 2) + "," + text.substring(i + 2, text.length);
    }
  }

  return text;
}

export function preprocessClue(clue: string) {
  clue = clue.replace(/\n/g, " ").trim();
  if (!clue.endsWith(")")) {
    clue += ")";
  }

  return clue;
}

/* Extracts clues from a block of text using a regex. */
export function extractClues(text: string): Partial<Clue>[] {
  text = preprocess(text);

  console.log(text);

  // lol
  let maxClue = 0;
  return (
    text
      // Split text into separate clues.
      .split("\n\n")
      // Map clues to regex groups.
      .map((c) => /(\d+)\s+(.*)\((.+?)(?:[,.]|)\)/g.exec(preprocessClue(c)))
      // Filter any 'clues' that aren't actually clues (that don't match regex).
      .filter((m) => m && m.length == 4)
      // Map regex matches to partial clue object.
      .map((m) => {
        // Sometimes the preceding 1 gets stripped from numbers > 10.
        // Use the fact that clues are in order to account for this.
        let clueNumber = +m![1];
        maxClue = Math.max(clueNumber, maxClue);
        if (clueNumber < maxClue) {
          clueNumber += 10;
        }

        const lengths = m![3].split(/[.,]/g).map((l) => +l.trim());
        // Use regex groups to build partial clue object.
        return {
          number: clueNumber,
          text: `${m![2].trim()} (${m![3].replace(".", ",")})`,
          lengths: lengths,
          totalLength: lengths.reduce((sum, next) => sum + next, 0),
        };
      })
  );
}

/* Reduced function to replace clue texts/lengths in processed grid. */
export function fillClues(
  acrossClues: Partial<Clue>[],
  downClues: Partial<Clue>[],
  grid: Puzzle
) {
  function fill(direction: ClueDirection, clue: Partial<Clue>) {
    const matching = grid.clues.find(
      (c) => c.number == clue.number && c.direction == direction
    );
    console.log(clue, matching);
    if (matching) {
      Object.assign(matching, clue);
    }
  }

  acrossClues.forEach((clue) => fill(ClueDirection.Across, clue));
  downClues.forEach((clue) => fill(ClueDirection.Down, clue));
}
