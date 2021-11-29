import ExplanationNode from "./ExplanationNode";

export default class Word implements ExplanationNode {
  word: string;

  constructor(word: string) {
    this.word = word;
  }
}
