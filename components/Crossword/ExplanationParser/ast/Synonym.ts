import ExplanationNode from "./ExplanationNode";

export default class Synonym implements ExplanationNode {
  left: ExplanationNode;
  right: ExplanationNode;

  constructor(left: ExplanationNode, right: ExplanationNode) {
    this.left = left;
    this.right = right;
  }
}
