import { MorseGrammarLexer } from "antlr/MorseGrammarLexer";
import { MorseGrammarParser } from "antlr/MorseGrammarParser";
import { CharStreams, CommonTokenStream } from "antlr4ts";
import ExplanationVisitor from "./ExplanationVisitor";

export function parseExplanation(explanation: string) {
  explanation = explanation.replaceAll(
    /\+\[(.*?)\]/g,
    (_, g) => `charade[${g}]`
  );
  const lexer = new MorseGrammarLexer(CharStreams.fromString(explanation));
  const parser = new MorseGrammarParser(new CommonTokenStream(lexer));

  const tree = parser.fullExplanation();
  const parsed = new ExplanationVisitor().visitFullExplanation(tree);
  return parsed;
}
