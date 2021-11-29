import ExplanationNode from "./ExplanationNode";

export default class SimpleOperation implements ExplanationNode {
  operation: string;
  source: string;

  constructor(operation: string, source: string) {
    this.operation = operation;
    this.source = source;
  }
}
