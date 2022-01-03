import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import {
  WordExplanationContext,
  FullExplanationContext,
  SimpleOperationContext,
  WordJoinContext,
  ComplexOperationContext,
  SynonymContext,
  HyponymContext,
  DuplicateContext,
  SubtractContext,
  MultiWordContext,
  InsertContext,
  AnagramContext,
  CharadeContext,
} from "antlr/MorseGrammarParser";
import { MorseGrammarVisitor } from "antlr/MorseGrammarVisitor";
import ComplexOperation from "./ast/ComplexOperation";
import Duplicate from "./ast/Duplicate";
import Explanation from "./ast/Explanation";
import ExplanationNode from "./ast/ExplanationNode";
import FullExplanation from "./ast/FullExplanation";
import Hyponym from "./ast/Hyponym";
import Insert from "./ast/Insert";
import SimpleOperation from "./ast/SimpleOperation";
import Subtract from "./ast/Subtract";
import Synonym from "./ast/Synonym";
import Word from "./ast/Word";
import WordJoin from "./ast/WordJoin";
import MultiNode from "./ast/MultiNode";

export default class ExplanationVisitor
  extends AbstractParseTreeVisitor<ExplanationNode>
  implements MorseGrammarVisitor<ExplanationNode>
{
  protected defaultResult(): ExplanationNode {
    return {
      result: "",
      toEnglish: () => [],
    };
  }

  visitFullExplanation(context: FullExplanationContext) {
    const definition = this.getMultiWordText(context.multiWord());
    const subexplanation = this.visit(context.explanation());
    let link = undefined;
    const subject = context.subject();
    if (subject) {
      link = this.getMultiWordText(subject.multiWord());
    }
    return new FullExplanation(definition, subexplanation, link);
  }

  visitWordExplanation(context: WordExplanationContext): ExplanationNode {
    const word = this.getMultiWordText(context.multiWord());
    return new Explanation(
      word,
      context.explanation().map((e) => this.visit(e))
    );
  }

  visitSimpleOperation(context: SimpleOperationContext): SimpleOperation {
    const operation = context.SIMPLE_OPERATION().text;
    const source = this.getMultiWordText(context.subject().multiWord());
    return new SimpleOperation(operation, source);
  }

  visitComplexOperation(context: ComplexOperationContext): ComplexOperation {
    const operation = context.COMPLEX_OPERATION().text;
    const source = this.getMultiWordText(context.subject().multiWord());
    const subject = this.visit(context.explanation());
    return new ComplexOperation(operation, source, subject);
  }

  visitWordJoin(context: WordJoinContext): WordJoin {
    const words = context.explanation().map((w) => this.visit(w));
    return new WordJoin(words);
  }

  visitAnagram(context: AnagramContext): ComplexOperation | SimpleOperation {
    console.log(context);
    const operation = context.ANAGRAM().text;
    const source = this.getMultiWordText(context.subject().multiWord());
    const subjectContext = context.explanation();
    if (subjectContext) {
      const subject = this.visit(subjectContext);
      return new ComplexOperation(operation, source, subject);
    }

    return new SimpleOperation(operation, source);
  }

  visitSynonym(context: SynonymContext): Synonym {
    const left = this.visit(context.explanation(0));
    const right = this.visit(context.explanation(1));
    return new Synonym(left, right);
  }

  visitHyponym(context: HyponymContext): Hyponym {
    const source = this.getMultiWordText(context.subject().multiWord());
    const left = this.visit(context.explanation(0));
    const right = this.visit(context.explanation(1));
    return new Hyponym(source, left, right);
  }

  visitDuplicate(context: DuplicateContext): Duplicate {
    const source = this.getMultiWordText(context.subject().multiWord());
    const first = this.visit(context.explanation(0));
    const last = this.visit(context.explanation(1));
    return new Duplicate(source, first, last);
  }

  visitInsert(context: InsertContext): Insert {
    const source = this.getMultiWordText(context.subject().multiWord());
    const node = this.visit(context.explanation(0));
    const into = this.visit(context.explanation(1));
    return new Insert(source, node, into);
  }

  visitSubtract(context: SubtractContext): Subtract {
    const source = this.getMultiWordText(context.subject().multiWord());
    const node = this.visit(context.explanation(0));
    const from = this.visit(context.explanation(1));
    return new Subtract(source, node, from);
  }

  visitMultiWord(context: MultiWordContext): Word {
    const word = this.getMultiWordText(context);
    return new Word(word);
  }

  visitCharade(context: CharadeContext): MultiNode {
    const indicator = this.getMultiWordText(context.subject().multiWord());
    return new MultiNode([
      new SimpleOperation("join", indicator),
      new WordJoin(context.explanation().map((e) => this.visit(e))),
    ]);
  }

  getMultiWordText(context: MultiWordContext): string {
    return context
      .WORD()
      .map((w) => w.text)
      .join(" ");
  }
}
