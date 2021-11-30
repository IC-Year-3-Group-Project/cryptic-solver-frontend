// Generated from MorseGrammar.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { MorseGrammarListener } from "./MorseGrammarListener";
import { MorseGrammarVisitor } from "./MorseGrammarVisitor";


export class MorseGrammarParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly WS = 3;
	public static readonly DEFINITION_SPLIT = 4;
	public static readonly OPEN_BRACKET = 5;
	public static readonly CLOSE_BRACKET = 6;
	public static readonly WORD_JOIN = 7;
	public static readonly EQUALS = 8;
	public static readonly INTO = 9;
	public static readonly FROM = 10;
	public static readonly ANAGRAM = 11;
	public static readonly HYPONYM = 12;
	public static readonly DUPLICATE = 13;
	public static readonly INSERT = 14;
	public static readonly SUBTRACT = 15;
	public static readonly SIMPLE_OPERATION = 16;
	public static readonly COMPLEX_OPERATION = 17;
	public static readonly WORD = 18;
	public static readonly RULE_multiWord = 0;
	public static readonly RULE_subject = 1;
	public static readonly RULE_explanation = 2;
	public static readonly RULE_fullExplanation = 3;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"multiWord", "subject", "explanation", "fullExplanation",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'['", "']'", undefined, "'->'", "'('", "')'", "'+'", "'='", 
		"'into'", "'from'", "'anagram'", "'hyponym'", "'duplicate'", "'insert'", 
		"'subtract'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, "WS", "DEFINITION_SPLIT", "OPEN_BRACKET", 
		"CLOSE_BRACKET", "WORD_JOIN", "EQUALS", "INTO", "FROM", "ANAGRAM", "HYPONYM", 
		"DUPLICATE", "INSERT", "SUBTRACT", "SIMPLE_OPERATION", "COMPLEX_OPERATION", 
		"WORD",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(MorseGrammarParser._LITERAL_NAMES, MorseGrammarParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return MorseGrammarParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "MorseGrammar.g4"; }

	// @Override
	public get ruleNames(): string[] { return MorseGrammarParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return MorseGrammarParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(MorseGrammarParser._ATN, this);
	}
	// @RuleVersion(0)
	public multiWord(): MultiWordContext {
		let _localctx: MultiWordContext = new MultiWordContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, MorseGrammarParser.RULE_multiWord);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 9;
			this._errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					this.state = 8;
					this.match(MorseGrammarParser.WORD);
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 11;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 0, this._ctx);
			} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public subject(): SubjectContext {
		let _localctx: SubjectContext = new SubjectContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, MorseGrammarParser.RULE_subject);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 13;
			this.match(MorseGrammarParser.T__0);
			this.state = 14;
			this.multiWord();
			this.state = 15;
			this.match(MorseGrammarParser.T__1);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public explanation(): ExplanationContext;
	public explanation(_p: number): ExplanationContext;
	// @RuleVersion(0)
	public explanation(_p?: number): ExplanationContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: ExplanationContext = new ExplanationContext(this._ctx, _parentState);
		let _prevctx: ExplanationContext = _localctx;
		let _startState: number = 4;
		this.enterRecursionRule(_localctx, 4, MorseGrammarParser.RULE_explanation, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 65;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 3, this._ctx) ) {
			case 1:
				{
				_localctx = new AnagramContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 18;
				this.match(MorseGrammarParser.ANAGRAM);
				this.state = 19;
				this.subject();
				this.state = 21;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 1, this._ctx) ) {
				case 1:
					{
					this.state = 20;
					this.explanation(0);
					}
					break;
				}
				}
				break;

			case 2:
				{
				_localctx = new SimpleOperationContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 23;
				this.match(MorseGrammarParser.SIMPLE_OPERATION);
				this.state = 24;
				this.subject();
				}
				break;

			case 3:
				{
				_localctx = new ComplexOperationContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 25;
				this.match(MorseGrammarParser.COMPLEX_OPERATION);
				this.state = 26;
				this.subject();
				this.state = 27;
				this.explanation(7);
				}
				break;

			case 4:
				{
				_localctx = new WordExplanationContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 29;
				this.multiWord();
				this.state = 30;
				this.match(MorseGrammarParser.OPEN_BRACKET);
				this.state = 32;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				do {
					{
					{
					this.state = 31;
					this.explanation(0);
					}
					}
					this.state = 34;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << MorseGrammarParser.ANAGRAM) | (1 << MorseGrammarParser.HYPONYM) | (1 << MorseGrammarParser.DUPLICATE) | (1 << MorseGrammarParser.INSERT) | (1 << MorseGrammarParser.SUBTRACT) | (1 << MorseGrammarParser.SIMPLE_OPERATION) | (1 << MorseGrammarParser.COMPLEX_OPERATION) | (1 << MorseGrammarParser.WORD))) !== 0));
				this.state = 36;
				this.match(MorseGrammarParser.CLOSE_BRACKET);
				}
				break;

			case 5:
				{
				_localctx = new HyponymContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 38;
				this.match(MorseGrammarParser.HYPONYM);
				this.state = 39;
				this.subject();
				this.state = 40;
				this.explanation(0);
				this.state = 41;
				this.match(MorseGrammarParser.EQUALS);
				this.state = 42;
				this.explanation(5);
				}
				break;

			case 6:
				{
				_localctx = new DuplicateContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 44;
				this.match(MorseGrammarParser.DUPLICATE);
				this.state = 45;
				this.subject();
				this.state = 46;
				this.match(MorseGrammarParser.OPEN_BRACKET);
				this.state = 47;
				this.explanation(0);
				this.state = 48;
				this.match(MorseGrammarParser.WORD_JOIN);
				this.state = 49;
				this.explanation(0);
				this.state = 50;
				this.match(MorseGrammarParser.CLOSE_BRACKET);
				}
				break;

			case 7:
				{
				_localctx = new InsertContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 52;
				this.match(MorseGrammarParser.INSERT);
				this.state = 53;
				this.subject();
				this.state = 54;
				this.explanation(0);
				this.state = 55;
				this.match(MorseGrammarParser.INTO);
				this.state = 56;
				this.explanation(3);
				}
				break;

			case 8:
				{
				_localctx = new SubtractContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 58;
				this.match(MorseGrammarParser.SUBTRACT);
				this.state = 59;
				this.subject();
				this.state = 60;
				this.explanation(0);
				this.state = 61;
				this.match(MorseGrammarParser.FROM);
				this.state = 62;
				this.explanation(2);
				}
				break;

			case 9:
				{
				_localctx = new WordContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 64;
				this.multiWord();
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 79;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 6, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 77;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 5, this._ctx) ) {
					case 1:
						{
						_localctx = new SynonymContext(new ExplanationContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, MorseGrammarParser.RULE_explanation);
						this.state = 67;
						if (!(this.precpred(this._ctx, 11))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 11)");
						}
						this.state = 68;
						this.match(MorseGrammarParser.EQUALS);
						this.state = 69;
						this.explanation(12);
						}
						break;

					case 2:
						{
						_localctx = new WordJoinContext(new ExplanationContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, MorseGrammarParser.RULE_explanation);
						this.state = 70;
						if (!(this.precpred(this._ctx, 10))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 10)");
						}
						this.state = 73;
						this._errHandler.sync(this);
						_alt = 1;
						do {
							switch (_alt) {
							case 1:
								{
								{
								this.state = 71;
								this.match(MorseGrammarParser.WORD_JOIN);
								this.state = 72;
								this.explanation(0);
								}
								}
								break;
							default:
								throw new NoViableAltException(this);
							}
							this.state = 75;
							this._errHandler.sync(this);
							_alt = this.interpreter.adaptivePredict(this._input, 4, this._ctx);
						} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
						}
						break;
					}
					}
				}
				this.state = 81;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 6, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public fullExplanation(): FullExplanationContext {
		let _localctx: FullExplanationContext = new FullExplanationContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, MorseGrammarParser.RULE_fullExplanation);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 82;
			this.multiWord();
			this.state = 83;
			this.match(MorseGrammarParser.DEFINITION_SPLIT);
			this.state = 85;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === MorseGrammarParser.T__0) {
				{
				this.state = 84;
				this.subject();
				}
			}

			this.state = 87;
			this.explanation(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 2:
			return this.explanation_sempred(_localctx as ExplanationContext, predIndex);
		}
		return true;
	}
	private explanation_sempred(_localctx: ExplanationContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 11);

		case 1:
			return this.precpred(this._ctx, 10);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\x14\\\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x03\x02\x06\x02\f\n\x02" +
		"\r\x02\x0E\x02\r\x03\x03\x03\x03\x03\x03\x03\x03\x03\x04\x03\x04\x03\x04" +
		"\x03\x04\x05\x04\x18\n\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03" +
		"\x04\x03\x04\x03\x04\x03\x04\x06\x04#\n\x04\r\x04\x0E\x04$\x03\x04\x03" +
		"\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03" +
		"\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03" +
		"\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03" +
		"\x04\x05\x04D\n\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x06" +
		"\x04L\n\x04\r\x04\x0E\x04M\x07\x04P\n\x04\f\x04\x0E\x04S\v\x04\x03\x05" +
		"\x03\x05\x03\x05\x05\x05X\n\x05\x03\x05\x03\x05\x03\x05\x02\x02\x03\x06" +
		"\x06\x02\x02\x04\x02\x06\x02\b\x02\x02\x02\x02f\x02\v\x03\x02\x02\x02" +
		"\x04\x0F\x03\x02\x02\x02\x06C\x03\x02\x02\x02\bT\x03\x02\x02\x02\n\f\x07" +
		"\x14\x02\x02\v\n\x03\x02\x02\x02\f\r\x03\x02\x02\x02\r\v\x03\x02\x02\x02" +
		"\r\x0E\x03\x02\x02\x02\x0E\x03\x03\x02\x02\x02\x0F\x10\x07\x03\x02\x02" +
		"\x10\x11\x05\x02\x02\x02\x11\x12\x07\x04\x02\x02\x12\x05\x03\x02\x02\x02" +
		"\x13\x14\b\x04\x01\x02\x14\x15\x07\r\x02\x02\x15\x17\x05\x04\x03\x02\x16" +
		"\x18\x05\x06\x04\x02\x17\x16\x03\x02\x02\x02\x17\x18\x03\x02\x02\x02\x18" +
		"D\x03\x02\x02\x02\x19\x1A\x07\x12\x02\x02\x1AD\x05\x04\x03\x02\x1B\x1C" +
		"\x07\x13\x02\x02\x1C\x1D\x05\x04\x03\x02\x1D\x1E\x05\x06\x04\t\x1ED\x03" +
		"\x02\x02\x02\x1F \x05\x02\x02\x02 \"\x07\x07\x02\x02!#\x05\x06\x04\x02" +
		"\"!\x03\x02\x02\x02#$\x03\x02\x02\x02$\"\x03\x02\x02\x02$%\x03\x02\x02" +
		"\x02%&\x03\x02\x02\x02&\'\x07\b\x02\x02\'D\x03\x02\x02\x02()\x07\x0E\x02" +
		"\x02)*\x05\x04\x03\x02*+\x05\x06\x04\x02+,\x07\n\x02\x02,-\x05\x06\x04" +
		"\x07-D\x03\x02\x02\x02./\x07\x0F\x02\x02/0\x05\x04\x03\x0201\x07\x07\x02" +
		"\x0212\x05\x06\x04\x0223\x07\t\x02\x0234\x05\x06\x04\x0245\x07\b\x02\x02" +
		"5D\x03\x02\x02\x0267\x07\x10\x02\x0278\x05\x04\x03\x0289\x05\x06\x04\x02" +
		"9:\x07\v\x02\x02:;\x05\x06\x04\x05;D\x03\x02\x02\x02<=\x07\x11\x02\x02" +
		"=>\x05\x04\x03\x02>?\x05\x06\x04\x02?@\x07\f\x02\x02@A\x05\x06\x04\x04" +
		"AD\x03\x02\x02\x02BD\x05\x02\x02\x02C\x13\x03\x02\x02\x02C\x19\x03\x02" +
		"\x02\x02C\x1B\x03\x02\x02\x02C\x1F\x03\x02\x02\x02C(\x03\x02\x02\x02C" +
		".\x03\x02\x02\x02C6\x03\x02\x02\x02C<\x03\x02\x02\x02CB\x03\x02\x02\x02" +
		"DQ\x03\x02\x02\x02EF\f\r\x02\x02FG\x07\n\x02\x02GP\x05\x06\x04\x0EHK\f" +
		"\f\x02\x02IJ\x07\t\x02\x02JL\x05\x06\x04\x02KI\x03\x02\x02\x02LM\x03\x02" +
		"\x02\x02MK\x03\x02\x02\x02MN\x03\x02\x02\x02NP\x03\x02\x02\x02OE\x03\x02" +
		"\x02\x02OH\x03\x02\x02\x02PS\x03\x02\x02\x02QO\x03\x02\x02\x02QR\x03\x02" +
		"\x02\x02R\x07\x03\x02\x02\x02SQ\x03\x02\x02\x02TU\x05\x02\x02\x02UW\x07" +
		"\x06\x02\x02VX\x05\x04\x03\x02WV\x03\x02\x02\x02WX\x03\x02\x02\x02XY\x03" +
		"\x02\x02\x02YZ\x05\x06\x04\x02Z\t\x03\x02\x02\x02\n\r\x17$CMOQW";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!MorseGrammarParser.__ATN) {
			MorseGrammarParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(MorseGrammarParser._serializedATN));
		}

		return MorseGrammarParser.__ATN;
	}

}

export class MultiWordContext extends ParserRuleContext {
	public WORD(): TerminalNode[];
	public WORD(i: number): TerminalNode;
	public WORD(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(MorseGrammarParser.WORD);
		} else {
			return this.getToken(MorseGrammarParser.WORD, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return MorseGrammarParser.RULE_multiWord; }
	// @Override
	public enterRule(listener: MorseGrammarListener): void {
		if (listener.enterMultiWord) {
			listener.enterMultiWord(this);
		}
	}
	// @Override
	public exitRule(listener: MorseGrammarListener): void {
		if (listener.exitMultiWord) {
			listener.exitMultiWord(this);
		}
	}
	// @Override
	public accept<Result>(visitor: MorseGrammarVisitor<Result>): Result {
		if (visitor.visitMultiWord) {
			return visitor.visitMultiWord(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SubjectContext extends ParserRuleContext {
	public multiWord(): MultiWordContext {
		return this.getRuleContext(0, MultiWordContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return MorseGrammarParser.RULE_subject; }
	// @Override
	public enterRule(listener: MorseGrammarListener): void {
		if (listener.enterSubject) {
			listener.enterSubject(this);
		}
	}
	// @Override
	public exitRule(listener: MorseGrammarListener): void {
		if (listener.exitSubject) {
			listener.exitSubject(this);
		}
	}
	// @Override
	public accept<Result>(visitor: MorseGrammarVisitor<Result>): Result {
		if (visitor.visitSubject) {
			return visitor.visitSubject(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExplanationContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return MorseGrammarParser.RULE_explanation; }
	public copyFrom(ctx: ExplanationContext): void {
		super.copyFrom(ctx);
	}
}
export class SynonymContext extends ExplanationContext {
	public explanation(): ExplanationContext[];
	public explanation(i: number): ExplanationContext;
	public explanation(i?: number): ExplanationContext | ExplanationContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExplanationContext);
		} else {
			return this.getRuleContext(i, ExplanationContext);
		}
	}
	public EQUALS(): TerminalNode { return this.getToken(MorseGrammarParser.EQUALS, 0); }
	constructor(ctx: ExplanationContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: MorseGrammarListener): void {
		if (listener.enterSynonym) {
			listener.enterSynonym(this);
		}
	}
	// @Override
	public exitRule(listener: MorseGrammarListener): void {
		if (listener.exitSynonym) {
			listener.exitSynonym(this);
		}
	}
	// @Override
	public accept<Result>(visitor: MorseGrammarVisitor<Result>): Result {
		if (visitor.visitSynonym) {
			return visitor.visitSynonym(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class WordJoinContext extends ExplanationContext {
	public explanation(): ExplanationContext[];
	public explanation(i: number): ExplanationContext;
	public explanation(i?: number): ExplanationContext | ExplanationContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExplanationContext);
		} else {
			return this.getRuleContext(i, ExplanationContext);
		}
	}
	public WORD_JOIN(): TerminalNode[];
	public WORD_JOIN(i: number): TerminalNode;
	public WORD_JOIN(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(MorseGrammarParser.WORD_JOIN);
		} else {
			return this.getToken(MorseGrammarParser.WORD_JOIN, i);
		}
	}
	constructor(ctx: ExplanationContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: MorseGrammarListener): void {
		if (listener.enterWordJoin) {
			listener.enterWordJoin(this);
		}
	}
	// @Override
	public exitRule(listener: MorseGrammarListener): void {
		if (listener.exitWordJoin) {
			listener.exitWordJoin(this);
		}
	}
	// @Override
	public accept<Result>(visitor: MorseGrammarVisitor<Result>): Result {
		if (visitor.visitWordJoin) {
			return visitor.visitWordJoin(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AnagramContext extends ExplanationContext {
	public ANAGRAM(): TerminalNode { return this.getToken(MorseGrammarParser.ANAGRAM, 0); }
	public subject(): SubjectContext {
		return this.getRuleContext(0, SubjectContext);
	}
	public explanation(): ExplanationContext | undefined {
		return this.tryGetRuleContext(0, ExplanationContext);
	}
	constructor(ctx: ExplanationContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: MorseGrammarListener): void {
		if (listener.enterAnagram) {
			listener.enterAnagram(this);
		}
	}
	// @Override
	public exitRule(listener: MorseGrammarListener): void {
		if (listener.exitAnagram) {
			listener.exitAnagram(this);
		}
	}
	// @Override
	public accept<Result>(visitor: MorseGrammarVisitor<Result>): Result {
		if (visitor.visitAnagram) {
			return visitor.visitAnagram(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class SimpleOperationContext extends ExplanationContext {
	public SIMPLE_OPERATION(): TerminalNode { return this.getToken(MorseGrammarParser.SIMPLE_OPERATION, 0); }
	public subject(): SubjectContext {
		return this.getRuleContext(0, SubjectContext);
	}
	constructor(ctx: ExplanationContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: MorseGrammarListener): void {
		if (listener.enterSimpleOperation) {
			listener.enterSimpleOperation(this);
		}
	}
	// @Override
	public exitRule(listener: MorseGrammarListener): void {
		if (listener.exitSimpleOperation) {
			listener.exitSimpleOperation(this);
		}
	}
	// @Override
	public accept<Result>(visitor: MorseGrammarVisitor<Result>): Result {
		if (visitor.visitSimpleOperation) {
			return visitor.visitSimpleOperation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ComplexOperationContext extends ExplanationContext {
	public COMPLEX_OPERATION(): TerminalNode { return this.getToken(MorseGrammarParser.COMPLEX_OPERATION, 0); }
	public subject(): SubjectContext {
		return this.getRuleContext(0, SubjectContext);
	}
	public explanation(): ExplanationContext {
		return this.getRuleContext(0, ExplanationContext);
	}
	constructor(ctx: ExplanationContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: MorseGrammarListener): void {
		if (listener.enterComplexOperation) {
			listener.enterComplexOperation(this);
		}
	}
	// @Override
	public exitRule(listener: MorseGrammarListener): void {
		if (listener.exitComplexOperation) {
			listener.exitComplexOperation(this);
		}
	}
	// @Override
	public accept<Result>(visitor: MorseGrammarVisitor<Result>): Result {
		if (visitor.visitComplexOperation) {
			return visitor.visitComplexOperation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class WordExplanationContext extends ExplanationContext {
	public multiWord(): MultiWordContext {
		return this.getRuleContext(0, MultiWordContext);
	}
	public OPEN_BRACKET(): TerminalNode { return this.getToken(MorseGrammarParser.OPEN_BRACKET, 0); }
	public CLOSE_BRACKET(): TerminalNode { return this.getToken(MorseGrammarParser.CLOSE_BRACKET, 0); }
	public explanation(): ExplanationContext[];
	public explanation(i: number): ExplanationContext;
	public explanation(i?: number): ExplanationContext | ExplanationContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExplanationContext);
		} else {
			return this.getRuleContext(i, ExplanationContext);
		}
	}
	constructor(ctx: ExplanationContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: MorseGrammarListener): void {
		if (listener.enterWordExplanation) {
			listener.enterWordExplanation(this);
		}
	}
	// @Override
	public exitRule(listener: MorseGrammarListener): void {
		if (listener.exitWordExplanation) {
			listener.exitWordExplanation(this);
		}
	}
	// @Override
	public accept<Result>(visitor: MorseGrammarVisitor<Result>): Result {
		if (visitor.visitWordExplanation) {
			return visitor.visitWordExplanation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class HyponymContext extends ExplanationContext {
	public HYPONYM(): TerminalNode { return this.getToken(MorseGrammarParser.HYPONYM, 0); }
	public subject(): SubjectContext {
		return this.getRuleContext(0, SubjectContext);
	}
	public explanation(): ExplanationContext[];
	public explanation(i: number): ExplanationContext;
	public explanation(i?: number): ExplanationContext | ExplanationContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExplanationContext);
		} else {
			return this.getRuleContext(i, ExplanationContext);
		}
	}
	public EQUALS(): TerminalNode { return this.getToken(MorseGrammarParser.EQUALS, 0); }
	constructor(ctx: ExplanationContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: MorseGrammarListener): void {
		if (listener.enterHyponym) {
			listener.enterHyponym(this);
		}
	}
	// @Override
	public exitRule(listener: MorseGrammarListener): void {
		if (listener.exitHyponym) {
			listener.exitHyponym(this);
		}
	}
	// @Override
	public accept<Result>(visitor: MorseGrammarVisitor<Result>): Result {
		if (visitor.visitHyponym) {
			return visitor.visitHyponym(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class DuplicateContext extends ExplanationContext {
	public DUPLICATE(): TerminalNode { return this.getToken(MorseGrammarParser.DUPLICATE, 0); }
	public subject(): SubjectContext {
		return this.getRuleContext(0, SubjectContext);
	}
	public OPEN_BRACKET(): TerminalNode { return this.getToken(MorseGrammarParser.OPEN_BRACKET, 0); }
	public explanation(): ExplanationContext[];
	public explanation(i: number): ExplanationContext;
	public explanation(i?: number): ExplanationContext | ExplanationContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExplanationContext);
		} else {
			return this.getRuleContext(i, ExplanationContext);
		}
	}
	public WORD_JOIN(): TerminalNode { return this.getToken(MorseGrammarParser.WORD_JOIN, 0); }
	public CLOSE_BRACKET(): TerminalNode { return this.getToken(MorseGrammarParser.CLOSE_BRACKET, 0); }
	constructor(ctx: ExplanationContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: MorseGrammarListener): void {
		if (listener.enterDuplicate) {
			listener.enterDuplicate(this);
		}
	}
	// @Override
	public exitRule(listener: MorseGrammarListener): void {
		if (listener.exitDuplicate) {
			listener.exitDuplicate(this);
		}
	}
	// @Override
	public accept<Result>(visitor: MorseGrammarVisitor<Result>): Result {
		if (visitor.visitDuplicate) {
			return visitor.visitDuplicate(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class InsertContext extends ExplanationContext {
	public INSERT(): TerminalNode { return this.getToken(MorseGrammarParser.INSERT, 0); }
	public subject(): SubjectContext {
		return this.getRuleContext(0, SubjectContext);
	}
	public explanation(): ExplanationContext[];
	public explanation(i: number): ExplanationContext;
	public explanation(i?: number): ExplanationContext | ExplanationContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExplanationContext);
		} else {
			return this.getRuleContext(i, ExplanationContext);
		}
	}
	public INTO(): TerminalNode { return this.getToken(MorseGrammarParser.INTO, 0); }
	constructor(ctx: ExplanationContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: MorseGrammarListener): void {
		if (listener.enterInsert) {
			listener.enterInsert(this);
		}
	}
	// @Override
	public exitRule(listener: MorseGrammarListener): void {
		if (listener.exitInsert) {
			listener.exitInsert(this);
		}
	}
	// @Override
	public accept<Result>(visitor: MorseGrammarVisitor<Result>): Result {
		if (visitor.visitInsert) {
			return visitor.visitInsert(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class SubtractContext extends ExplanationContext {
	public SUBTRACT(): TerminalNode { return this.getToken(MorseGrammarParser.SUBTRACT, 0); }
	public subject(): SubjectContext {
		return this.getRuleContext(0, SubjectContext);
	}
	public explanation(): ExplanationContext[];
	public explanation(i: number): ExplanationContext;
	public explanation(i?: number): ExplanationContext | ExplanationContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExplanationContext);
		} else {
			return this.getRuleContext(i, ExplanationContext);
		}
	}
	public FROM(): TerminalNode { return this.getToken(MorseGrammarParser.FROM, 0); }
	constructor(ctx: ExplanationContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: MorseGrammarListener): void {
		if (listener.enterSubtract) {
			listener.enterSubtract(this);
		}
	}
	// @Override
	public exitRule(listener: MorseGrammarListener): void {
		if (listener.exitSubtract) {
			listener.exitSubtract(this);
		}
	}
	// @Override
	public accept<Result>(visitor: MorseGrammarVisitor<Result>): Result {
		if (visitor.visitSubtract) {
			return visitor.visitSubtract(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class WordContext extends ExplanationContext {
	public multiWord(): MultiWordContext {
		return this.getRuleContext(0, MultiWordContext);
	}
	constructor(ctx: ExplanationContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: MorseGrammarListener): void {
		if (listener.enterWord) {
			listener.enterWord(this);
		}
	}
	// @Override
	public exitRule(listener: MorseGrammarListener): void {
		if (listener.exitWord) {
			listener.exitWord(this);
		}
	}
	// @Override
	public accept<Result>(visitor: MorseGrammarVisitor<Result>): Result {
		if (visitor.visitWord) {
			return visitor.visitWord(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FullExplanationContext extends ParserRuleContext {
	public multiWord(): MultiWordContext {
		return this.getRuleContext(0, MultiWordContext);
	}
	public DEFINITION_SPLIT(): TerminalNode { return this.getToken(MorseGrammarParser.DEFINITION_SPLIT, 0); }
	public explanation(): ExplanationContext {
		return this.getRuleContext(0, ExplanationContext);
	}
	public subject(): SubjectContext | undefined {
		return this.tryGetRuleContext(0, SubjectContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return MorseGrammarParser.RULE_fullExplanation; }
	// @Override
	public enterRule(listener: MorseGrammarListener): void {
		if (listener.enterFullExplanation) {
			listener.enterFullExplanation(this);
		}
	}
	// @Override
	public exitRule(listener: MorseGrammarListener): void {
		if (listener.exitFullExplanation) {
			listener.exitFullExplanation(this);
		}
	}
	// @Override
	public accept<Result>(visitor: MorseGrammarVisitor<Result>): Result {
		if (visitor.visitFullExplanation) {
			return visitor.visitFullExplanation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


