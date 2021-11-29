import ExplanationNode from "./ExplanationNode";
import SimpleOperation from "./SimpleOperation";

export default class Insert extends SimpleOperation {
  node: ExplanationNode;
  into: ExplanationNode;

  get result() {
    return "insert";
  }

  constructor(source: string, node: ExplanationNode, into: ExplanationNode) {
    super("insert", source);
    this.node = node;
    this.into = into;
  }

  toEnglish(): string[] {
    return [
      ...this.node.toEnglish(),
      ...this.into.toEnglish(),
      `Insert ${this.node.result} into ${this.into.result}`,
    ];
  }
}
