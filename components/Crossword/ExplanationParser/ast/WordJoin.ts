import ExplanationNode from "./ExplanationNode";

export default class WordJoin implements ExplanationNode {
  words: ExplanationNode[];

  constructor(words: ExplanationNode[]) {
    this.words = words;
  }
}
