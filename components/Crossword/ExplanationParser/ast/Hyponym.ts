import ExplanationNode from "./ExplanationNode";
import SimpleOperation from "./SimpleOperation";

export default class Hyponym extends SimpleOperation {
  left: ExplanationNode;
  right: ExplanationNode;

  constructor(source: string, left: ExplanationNode, right: ExplanationNode) {
    super("hyponym", source);
    this.left = left;
    this.right = right;
  }
}
