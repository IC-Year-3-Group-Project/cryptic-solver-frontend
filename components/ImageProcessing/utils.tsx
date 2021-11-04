export function preprocess(text: string) {
  // Preprocess weird characters
  let character_replacements = new Map([
    ["©", "(5)"],
    ["|", "I"],
    ["®", "(5"],
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

export function extract_clues(text: string) {
  text = preprocess(text);

  console.log("Preprocessed text: " + text);

  let parts = text.split("\n\n");
  let clues = [];

  for (let part of parts) {
    let part_new = part.replace(/\n/g, "");
    let front = part_new;
    let lengths: string[] = [];

    if (part.includes("(")) {
      let splittedPart = part_new.split("(");
      front = splittedPart[0];
      let lengthsWithComma = splittedPart[1].substring(
        0,
        splittedPart[1].length - 1
      );

      if (lengthsWithComma.includes(",")) {
        lengths = lengthsWithComma.split(",");
      } else {
        lengths = [lengthsWithComma];
      }
    }

    let i = 0;
    while (front[i] != " ") {
      i++;
    }

    let number = front.substring(0, i);
    let clue = front.substring(i + 1);

    clues.push({
      clueNumber: number,
      clue: clue,
      lengths: lengths,
    });
  }
  return clues;
}

export function fill_clues(
  across_clues: { [key: string]: any },
  down_clues: { [key: string]: any },
  grid: { [key: string]: any }
) {
  let grid_clues = grid.payload.clues;

  down_clues.forEach(
    (clue: { clueNumber: string; clue: any; lengths: any[] }) => {
      grid_clues.forEach(
        (grid_clue: {
          direction: number;
          number: number;
          text: any;
          lengths: any;
        }) => {
          if (
            grid_clue.direction === 1 &&
            grid_clue.number === parseInt(clue.clueNumber)
          ) {
            grid_clue.text = clue.clue;
            grid_clue.lengths = clue.lengths.map((l) => parseInt(l));
          }
        }
      );
    }
  );

  across_clues.forEach(
    (clue: { clueNumber: string; clue: any; lengths: any[] }) => {
      grid_clues.forEach(
        (grid_clue: {
          direction: number;
          number: number;
          text: any;
          lengths: number[];
        }) => {
          if (
            grid_clue.direction === 0 &&
            grid_clue.number === parseInt(clue.clueNumber)
          ) {
            grid_clue.text = clue.clue;
            grid_clue.lengths = clue.lengths.map((l) => parseInt(l));
          }
        }
      );
    }
  );

  return grid;
}
