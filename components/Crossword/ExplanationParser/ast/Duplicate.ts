import ExplanationNode from "./ExplanationNode";
import SimpleOperation from "./SimpleOperation";

export default class Duplicate extends SimpleOperation {
  first: ExplanationNode;
  last: ExplanationNode;

  constructor(source: string, first: ExplanationNode, last: ExplanationNode) {
    super("duplicate", source);
    this.first = first;
    this.last = last;
  }
}
