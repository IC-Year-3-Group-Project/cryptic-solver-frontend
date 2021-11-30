import ExplanationNode from "./ExplanationNode";

export default class Synonym implements ExplanationNode {
  left: ExplanationNode;
  right: ExplanationNode;

  get result() {
    return this.left.result;
  }

  constructor(left: ExplanationNode, right: ExplanationNode) {
    this.left = left;
    this.right = right;
  }

  toEnglish(): string[] {
    return [
      ...this.left.toEnglish(),
      ...this.right.toEnglish(),
      `${this.left.result} is a synonym for ${this.right.result}`,
    ];
  }
}
