import ExplanationNode from "./ExplanationNode";

export default class FullExplanation implements ExplanationNode {
  definition: string;
  explanation: ExplanationNode;
  link?: string;

  constructor(definition: string, explanation: ExplanationNode, link?: string) {
    this.definition = definition;
    this.explanation = explanation;
    this.link = link;
  }
}
