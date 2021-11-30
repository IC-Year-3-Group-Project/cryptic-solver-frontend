import ExplanationNode from "./ExplanationNode";

export default class Word implements ExplanationNode {
  word: string;

  get result() {
    return this.word;
  }

  constructor(word: string) {
    this.word = word;
  }

  toEnglish(): string[] {
    return [];
  }
}
