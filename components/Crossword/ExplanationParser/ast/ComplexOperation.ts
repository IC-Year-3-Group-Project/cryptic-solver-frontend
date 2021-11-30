import ExplanationNode from "./ExplanationNode";
import SimpleOperation from "./SimpleOperation";

export default class ComplexOperation extends SimpleOperation {
  subject: ExplanationNode;

  get result() {
    return this.subject.result;
  }

  constructor(operation: string, source: string, subject: ExplanationNode) {
    super(operation, source);
    this.subject = subject;
  }

  toEnglish(): string[] {
    return [
      ...this.subject.toEnglish(),
      `'${this.source}' indicates ${this.operation}, acting on '${this.result}'`,
    ];
  }
}
