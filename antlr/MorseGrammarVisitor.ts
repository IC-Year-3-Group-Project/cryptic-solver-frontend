// Generated from MorseGrammar.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { SynonymContext } from "./MorseGrammarParser";
import { WordJoinContext } from "./MorseGrammarParser";
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
 * This interface defines a complete generic visitor for a parse tree produced
 * by `MorseGrammarParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface MorseGrammarVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `synonym`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSynonym?: (ctx: SynonymContext) => Result;

	/**
	 * Visit a parse tree produced by the `wordJoin`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitWordJoin?: (ctx: WordJoinContext) => Result;

	/**
	 * Visit a parse tree produced by the `anagram`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAnagram?: (ctx: AnagramContext) => Result;

	/**
	 * Visit a parse tree produced by the `simpleOperation`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSimpleOperation?: (ctx: SimpleOperationContext) => Result;

	/**
	 * Visit a parse tree produced by the `complexOperation`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitComplexOperation?: (ctx: ComplexOperationContext) => Result;

	/**
	 * Visit a parse tree produced by the `wordExplanation`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitWordExplanation?: (ctx: WordExplanationContext) => Result;

	/**
	 * Visit a parse tree produced by the `hyponym`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitHyponym?: (ctx: HyponymContext) => Result;

	/**
	 * Visit a parse tree produced by the `duplicate`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDuplicate?: (ctx: DuplicateContext) => Result;

	/**
	 * Visit a parse tree produced by the `insert`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInsert?: (ctx: InsertContext) => Result;

	/**
	 * Visit a parse tree produced by the `subtract`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSubtract?: (ctx: SubtractContext) => Result;

	/**
	 * Visit a parse tree produced by the `word`
	 * labeled alternative in `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitWord?: (ctx: WordContext) => Result;

	/**
	 * Visit a parse tree produced by `MorseGrammarParser.multiWord`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMultiWord?: (ctx: MultiWordContext) => Result;

	/**
	 * Visit a parse tree produced by `MorseGrammarParser.subject`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSubject?: (ctx: SubjectContext) => Result;

	/**
	 * Visit a parse tree produced by `MorseGrammarParser.explanation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExplanation?: (ctx: ExplanationContext) => Result;

	/**
	 * Visit a parse tree produced by `MorseGrammarParser.fullExplanation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFullExplanation?: (ctx: FullExplanationContext) => Result;
}

