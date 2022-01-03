// Generated from MorseGrammar.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { SynonymContext } from "./MorseGrammarParser";
import { WordJoinContext } from "./MorseGrammarParser";
import { CharadeContext } from "./MorseGrammarParser";
import { AnagramContext } from "./MorseGrammarParser";
import { SimpleOperationContext } from "./MorseGrammarParser";
import { ComplexOperationContext } from "./MorseGrammarParser";
import { WordExplanationContext } from "./MorseGrammarParser";
import { HyponymContext } from "./MorseGrammarParser";
import { DuplicateContext } from "./MorseGrammarParser";
import { InsertContext } from "./MorseGrammarParser";
import { SubtractContext } from "./MorseGrammarParser";
import { WordContext } from "./MorseGrammarParser";
import { MultiWordContext } from "./MorseGrammarParser";
import { SubjectContext } from "./MorseGrammarParser";
import { ExplanationContext } from "./MorseGrammarParser";
import { FullExplanationContext } from "./MorseGrammarParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `MorseGrammarParser`.
 */
export interface MorseGrammarListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `synonym`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	enterSynonym?: (ctx: SynonymContext) => void;
	/**
	 * Exit a parse tree produced by the `synonym`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	exitSynonym?: (ctx: SynonymContext) => void;

	/**
	 * Enter a parse tree produced by the `wordJoin`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	enterWordJoin?: (ctx: WordJoinContext) => void;
	/**
	 * Exit a parse tree produced by the `wordJoin`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	exitWordJoin?: (ctx: WordJoinContext) => void;

	/**
	 * Enter a parse tree produced by the `charade`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	enterCharade?: (ctx: CharadeContext) => void;
	/**
	 * Exit a parse tree produced by the `charade`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	exitCharade?: (ctx: CharadeContext) => void;

	/**
	 * Enter a parse tree produced by the `anagram`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	enterAnagram?: (ctx: AnagramContext) => void;
	/**
	 * Exit a parse tree produced by the `anagram`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	exitAnagram?: (ctx: AnagramContext) => void;

	/**
	 * Enter a parse tree produced by the `simpleOperation`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	enterSimpleOperation?: (ctx: SimpleOperationContext) => void;
	/**
	 * Exit a parse tree produced by the `simpleOperation`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	exitSimpleOperation?: (ctx: SimpleOperationContext) => void;

	/**
	 * Enter a parse tree produced by the `complexOperation`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	enterComplexOperation?: (ctx: ComplexOperationContext) => void;
	/**
	 * Exit a parse tree produced by the `complexOperation`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	exitComplexOperation?: (ctx: ComplexOperationContext) => void;

	/**
	 * Enter a parse tree produced by the `wordExplanation`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	enterWordExplanation?: (ctx: WordExplanationContext) => void;
	/**
	 * Exit a parse tree produced by the `wordExplanation`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	exitWordExplanation?: (ctx: WordExplanationContext) => void;

	/**
	 * Enter a parse tree produced by the `hyponym`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	enterHyponym?: (ctx: HyponymContext) => void;
	/**
	 * Exit a parse tree produced by the `hyponym`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	exitHyponym?: (ctx: HyponymContext) => void;

	/**
	 * Enter a parse tree produced by the `duplicate`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	enterDuplicate?: (ctx: DuplicateContext) => void;
	/**
	 * Exit a parse tree produced by the `duplicate`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	exitDuplicate?: (ctx: DuplicateContext) => void;

	/**
	 * Enter a parse tree produced by the `insert`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	enterInsert?: (ctx: InsertContext) => void;
	/**
	 * Exit a parse tree produced by the `insert`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	exitInsert?: (ctx: InsertContext) => void;

	/**
	 * Enter a parse tree produced by the `subtract`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	enterSubtract?: (ctx: SubtractContext) => void;
	/**
	 * Exit a parse tree produced by the `subtract`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	exitSubtract?: (ctx: SubtractContext) => void;

	/**
	 * Enter a parse tree produced by the `word`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	enterWord?: (ctx: WordContext) => void;
	/**
	 * Exit a parse tree produced by the `word`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	exitWord?: (ctx: WordContext) => void;

	/**
	 * Enter a parse tree produced by `MorseGrammarParser.multiWord`.
	 * @param ctx the parse tree
	 */
	enterMultiWord?: (ctx: MultiWordContext) => void;
	/**
	 * Exit a parse tree produced by `MorseGrammarParser.multiWord`.
	 * @param ctx the parse tree
	 */
	exitMultiWord?: (ctx: MultiWordContext) => void;

	/**
	 * Enter a parse tree produced by `MorseGrammarParser.subject`.
	 * @param ctx the parse tree
	 */
	enterSubject?: (ctx: SubjectContext) => void;
	/**
	 * Exit a parse tree produced by `MorseGrammarParser.subject`.
	 * @param ctx the parse tree
	 */
	exitSubject?: (ctx: SubjectContext) => void;

	/**
	 * Enter a parse tree produced by `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	enterExplanation?: (ctx: ExplanationContext) => void;
	/**
	 * Exit a parse tree produced by `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 */
	exitExplanation?: (ctx: ExplanationContext) => void;

	/**
	 * Enter a parse tree produced by `MorseGrammarParser.fullExplanation`.
	 * @param ctx the parse tree
	 */
	enterFullExplanation?: (ctx: FullExplanationContext) => void;
	/**
	 * Exit a parse tree produced by `MorseGrammarParser.fullExplanation`.
	 * @param ctx the parse tree
	 */
	exitFullExplanation?: (ctx: FullExplanationContext) => void;
}

