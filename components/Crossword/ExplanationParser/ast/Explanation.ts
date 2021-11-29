import ExplanationNode from "./ExplanationNode";

export default class Explanation implements ExplanationNode {
  word: string;
  explanations: ExplanationNode[];

  get result() {
    return this.word;
  }

  constructor(word: string, explanations: ExplanationNode[]) {
    this.word = word;
    this.explanations = explanations;
  }

  toEnglish(): string[] {
    return this.explanations.flatMap((e) => e.toEnglish());
  }
}
