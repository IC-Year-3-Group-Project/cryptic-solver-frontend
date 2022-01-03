import { articulate } from "../utils";
import ExplanationNode from "./ExplanationNode";

const Indicators = ["anagram", "join"];

export default class SimpleOperation implements ExplanationNode {
  operation: string;
  source: string;

  get result() {
    return this.operation;
  }

  constructor(operation: string, source: string) {
    this.operation = operation;
    this.source = source;
  }

  toEnglish(): string[] {
    return Indicators.includes(this.operation)
      ? [`'${this.source}' indicates ${articulate(this.operation)}`]
      : [`${this.operation} on '${this.source}'`];
  }
}
