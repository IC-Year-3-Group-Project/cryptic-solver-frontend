export default interface ExplanationNode {
  get result(): string;
  toEnglish(): string[];
}
