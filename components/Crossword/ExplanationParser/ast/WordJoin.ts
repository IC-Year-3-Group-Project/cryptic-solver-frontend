import ExplanationNode from "./ExplanationNode";

export default class WordJoin implements ExplanationNode {
  words: ExplanationNode[];

  get result() {
    return this.words.map((w) => w.result).join(" ");
  }

  constructor(words: ExplanationNode[]) {
    this.words = words;
  }

  toEnglish(): string[] {
    return [
      ...this.words.flatMap((w) => w.toEnglish()),
      `Join '${this.words[0].result}', '${this.words[1].result}' to get '${this.result}'`,
    ];
  }
}
