import ExplanationNode from "./ExplanationNode";
import SimpleOperation from "./SimpleOperation";

export default class Duplicate extends SimpleOperation {
  first: ExplanationNode;
  last: ExplanationNode;

  get result() {
    return `${this.first.result} ${this.last.result}`;
  }

  constructor(source: string, first: ExplanationNode, last: ExplanationNode) {
    super("duplicate", source);
    this.first = first;
    this.last = last;
  }

  toEnglish(): string[] {
    return [
      ...this.first.toEnglish(),
      ...this.last.toEnglish(),
      `Duplicate ${this.result}`,
    ];
  }
}
