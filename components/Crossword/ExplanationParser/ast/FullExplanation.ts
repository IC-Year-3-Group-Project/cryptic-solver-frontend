import ExplanationNode from "./ExplanationNode";

export default class FullExplanation implements ExplanationNode {
  definition: string;
  explanation: ExplanationNode;
  link?: string;

  get result() {
    return this.explanation.result;
  }

  constructor(definition: string, explanation: ExplanationNode, link?: string) {
    this.definition = definition;
    this.explanation = explanation;
    this.link = link;
  }

  toEnglish(): string[] {
    return [
      `The definition is given by '${this.definition}'`,
      ...this.explanation.toEnglish(),
      ...(this.link ? [`The link is '${this.link}'`] : []),
    ];
  }
}
