import ExplanationNode from "./ExplanationNode";
import SimpleOperation from "./SimpleOperation";

export default class Hyponym extends SimpleOperation {
  left: ExplanationNode;
  right: ExplanationNode;

  get result() {
    return this.left.result;
  }

  constructor(source: string, left: ExplanationNode, right: ExplanationNode) {
    super("hyponym", source);
    this.left = left;
    this.right = right;
  }

  toEnglish(): string[] {
    return [
      ...this.left.toEnglish(),
      ...this.right.toEnglish(),
      `${this.left.result} is a hyponym for ${this.right.result}`,
    ];
  }
}
