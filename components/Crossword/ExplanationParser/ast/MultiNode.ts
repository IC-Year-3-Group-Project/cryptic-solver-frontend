import ExplanationNode from "./ExplanationNode";

export default class MultiNode implements ExplanationNode {
  nodes: ExplanationNode[];

  get result(): string {
    return this.nodes.length > 0 ? this.nodes[0].result : "previous";
  }

  constructor(nodes: ExplanationNode[]) {
    this.nodes = nodes;
  }

  toEnglish(): string[] {
    return this.nodes.flatMap((n) => n.toEnglish());
  }
}
