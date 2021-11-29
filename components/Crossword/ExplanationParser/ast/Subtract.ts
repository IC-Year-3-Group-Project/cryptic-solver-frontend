import ExplanationNode from "./ExplanationNode";
import SimpleOperation from "./SimpleOperation";

export default class Subtract extends SimpleOperation {
  node: ExplanationNode;
  from: ExplanationNode;

  constructor(source: string, node: ExplanationNode, from: ExplanationNode) {
    super("subtract", source);
    this.node = node;
    this.from = from;
  }
}
