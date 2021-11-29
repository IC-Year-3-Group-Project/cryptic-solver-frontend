import ExplanationNode from "./ExplanationNode";

export default class Explanation implements ExplanationNode {
  word: string;
  explanations: ExplanationNode[];

  constructor(word: string, explanations: ExplanationNode[]) {
    this.word = word;
    this.explanations = explanations;
  }
}
