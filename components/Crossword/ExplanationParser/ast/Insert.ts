import ExplanationNode from "./ExplanationNode";
import SimpleOperation from "./SimpleOperation";

export default class Insert extends SimpleOperation {
  node: ExplanationNode;
  into: ExplanationNode;

  constructor(source: string, node: ExplanationNode, into: ExplanationNode) {
    super("insert", source);
    this.node = node;
    this.into = into;
  }
}
