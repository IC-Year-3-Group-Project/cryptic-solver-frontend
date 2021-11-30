import ExplanationNode from "./ExplanationNode";
import SimpleOperation from "./SimpleOperation";

export default class Subtract extends SimpleOperation {
  node: ExplanationNode;
  from: ExplanationNode;

  get result() {
    return "subtract";
  }

  constructor(source: string, node: ExplanationNode, from: ExplanationNode) {
    super("subtract", source);
    this.node = node;
    this.from = from;
  }

  toEnglish(): string[] {
    return [
      ...this.node.toEnglish(),
      ...this.from.toEnglish(),
      `Subtract ${this.node.result} from ${this.from.result}`,
    ];
  }
}
