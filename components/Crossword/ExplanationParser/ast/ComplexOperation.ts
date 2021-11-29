import ExplanationNode from "./ExplanationNode";
import SimpleOperation from "./SimpleOperation";

export default class ComplexOperation extends SimpleOperation {
  subject: ExplanationNode;

  constructor(operation: string, source: string, subject: ExplanationNode) {
    super(operation, source);
    this.subject = subject;
  }
}
