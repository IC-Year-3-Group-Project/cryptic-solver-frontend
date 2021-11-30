// Generated from MorseGrammar.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { CharStream } from "antlr4ts/CharStream";
import { Lexer } from "antlr4ts/Lexer";
import { LexerATNSimulator } from "antlr4ts/atn/LexerATNSimulator";
import { NotNull } from "antlr4ts/Decorators";
import { Override } from "antlr4ts/Decorators";
import { RuleContext } from "antlr4ts/RuleContext";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";


export class MorseGrammarLexer extends Lexer {
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

	// tslint:disable:no-trailing-whitespace
	public static readonly channelNames: string[] = [
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN",
	];

	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE",
	];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "WS", "DEFINITION_SPLIT", "OPEN_BRACKET", "CLOSE_BRACKET", 
		"WORD_JOIN", "EQUALS", "INTO", "FROM", "ANAGRAM", "HYPONYM", "DUPLICATE", 
		"INSERT", "SUBTRACT", "SIMPLE_OPERATION", "COMPLEX_OPERATION", "WORD",
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
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(MorseGrammarLexer._LITERAL_NAMES, MorseGrammarLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return MorseGrammarLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(MorseGrammarLexer._ATN, this);
	}

	// @Override
	public get grammarFileName(): string { return "MorseGrammar.g4"; }

	// @Override
	public get ruleNames(): string[] { return MorseGrammarLexer.ruleNames; }

	// @Override
	public get serializedATN(): string { return MorseGrammarLexer._serializedATN; }

	// @Override
	public get channelNames(): string[] { return MorseGrammarLexer.channelNames; }

	// @Override
	public get modeNames(): string[] { return MorseGrammarLexer.modeNames; }

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x02\x14\xEF\b\x01" +
		"\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06" +
		"\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r" +
		"\t\r\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t" +
		"\x12\x04\x13\t\x13\x03\x02\x03\x02\x03\x03\x03\x03\x03\x04\x06\x04-\n" +
		"\x04\r\x04\x0E\x04.\x03\x04\x03\x04\x03\x05\x03\x05\x03\x05\x03\x06\x03" +
		"\x06\x03\x07\x03\x07\x03\b\x03\b\x03\t\x03\t\x03\n\x03\n\x03\n\x03\n\x03" +
		"\n\x03\v\x03\v\x03\v\x03\v\x03\v\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03" +
		"\f\x03\f\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\x0E\x03\x0E" +
		"\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0F" +
		"\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x10\x03\x10\x03\x10" +
		"\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x11\x03\x11\x03\x11" +
		"\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11" +
		"\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11" +
		"\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11" +
		"\x05\x11\x90\n\x11\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x05" +
		"\x12\xE9\n\x12\x03\x13\x06\x13\xEC\n\x13\r\x13\x0E\x13\xED\x02\x02\x02" +
		"\x14\x03\x02\x03\x05\x02\x04\x07\x02\x05\t\x02\x06\v\x02\x07\r\x02\b\x0F" +
		"\x02\t\x11\x02\n\x13\x02\v\x15\x02\f\x17\x02\r\x19\x02\x0E\x1B\x02\x0F" +
		"\x1D\x02\x10\x1F\x02\x11!\x02\x12#\x02\x13%\x02\x14\x03\x02\x04\x05\x02" +
		"\v\f\x0F\x0F\"\"\b\x02//2;>>@@C\\c|\x02\xF9\x02\x03\x03\x02\x02\x02\x02" +
		"\x05\x03\x02\x02\x02\x02\x07\x03\x02\x02\x02\x02\t\x03\x02\x02\x02\x02" +
		"\v\x03\x02\x02\x02\x02\r\x03\x02\x02\x02\x02\x0F\x03\x02\x02\x02\x02\x11" +
		"\x03\x02\x02\x02\x02\x13\x03\x02\x02\x02\x02\x15\x03\x02\x02\x02\x02\x17" +
		"\x03\x02\x02\x02\x02\x19\x03\x02\x02\x02\x02\x1B\x03\x02\x02\x02\x02\x1D" +
		"\x03\x02\x02\x02\x02\x1F\x03\x02\x02\x02\x02!\x03\x02\x02\x02\x02#\x03" +
		"\x02\x02\x02\x02%\x03\x02\x02\x02\x03\'\x03\x02\x02\x02\x05)\x03\x02\x02" +
		"\x02\x07,\x03\x02\x02\x02\t2\x03\x02\x02\x02\v5\x03\x02\x02\x02\r7\x03" +
		"\x02\x02\x02\x0F9\x03\x02\x02\x02\x11;\x03\x02\x02\x02\x13=\x03\x02\x02" +
		"\x02\x15B\x03\x02\x02\x02\x17G\x03\x02\x02\x02\x19O\x03\x02\x02\x02\x1B" +
		"W\x03\x02\x02\x02\x1Da\x03\x02\x02\x02\x1Fh\x03\x02\x02\x02!\x8F\x03\x02" +
		"\x02\x02#\xE8\x03\x02\x02\x02%\xEB\x03\x02\x02\x02\'(\x07]\x02\x02(\x04" +
		"\x03\x02\x02\x02)*\x07_\x02\x02*\x06\x03\x02\x02\x02+-\t\x02\x02\x02," +
		"+\x03\x02\x02\x02-.\x03\x02\x02\x02.,\x03\x02\x02\x02./\x03\x02\x02\x02" +
		"/0\x03\x02\x02\x0201\b\x04\x02\x021\b\x03\x02\x02\x0223\x07/\x02\x023" +
		"4\x07@\x02\x024\n\x03\x02\x02\x0256\x07*\x02\x026\f\x03\x02\x02\x0278" +
		"\x07+\x02\x028\x0E\x03\x02\x02\x029:\x07-\x02\x02:\x10\x03\x02\x02\x02" +
		";<\x07?\x02\x02<\x12\x03\x02\x02\x02=>\x07k\x02\x02>?\x07p\x02\x02?@\x07" +
		"v\x02\x02@A\x07q\x02\x02A\x14\x03\x02\x02\x02BC\x07h\x02\x02CD\x07t\x02" +
		"\x02DE\x07q\x02\x02EF\x07o\x02\x02F\x16\x03\x02\x02\x02GH\x07c\x02\x02" +
		"HI\x07p\x02\x02IJ\x07c\x02\x02JK\x07i\x02\x02KL\x07t\x02\x02LM\x07c\x02" +
		"\x02MN\x07o\x02\x02N\x18\x03\x02\x02\x02OP\x07j\x02\x02PQ\x07{\x02\x02" +
		"QR\x07r\x02\x02RS\x07q\x02\x02ST\x07p\x02\x02TU\x07{\x02\x02UV\x07o\x02" +
		"\x02V\x1A\x03\x02\x02\x02WX\x07f\x02\x02XY\x07w\x02\x02YZ\x07r\x02\x02" +
		"Z[\x07n\x02\x02[\\\x07k\x02\x02\\]\x07e\x02\x02]^\x07c\x02\x02^_\x07v" +
		"\x02\x02_`\x07g\x02\x02`\x1C\x03\x02\x02\x02ab\x07k\x02\x02bc\x07p\x02" +
		"\x02cd\x07u\x02\x02de\x07g\x02\x02ef\x07t\x02\x02fg\x07v\x02\x02g\x1E" +
		"\x03\x02\x02\x02hi\x07u\x02\x02ij\x07w\x02\x02jk\x07d\x02\x02kl\x07v\x02" +
		"\x02lm\x07t\x02\x02mn\x07c\x02\x02no\x07e\x02\x02op\x07v\x02\x02p \x03" +
		"\x02\x02\x02qr\x07e\x02\x02rs\x07j\x02\x02st\x07c\x02\x02tu\x07t\x02\x02" +
		"uv\x07c\x02\x02vw\x07f\x02\x02w\x90\x07g\x02\x02xy\x07q\x02\x02yz\x07" +
		"f\x02\x02z{\x07f\x02\x02{|\x07\"\x02\x02|}\x07n\x02\x02}~\x07g\x02\x02" +
		"~\x7F\x07v\x02\x02\x7F\x80\x07v\x02\x02\x80\x81\x07g\x02\x02\x81\x82\x07" +
		"t\x02\x02\x82\x90\x07u\x02\x02\x83\x84\x07g\x02\x02\x84\x85\x07x\x02\x02" +
		"\x85\x86\x07g\x02\x02\x86\x87\x07p\x02\x02\x87\x88\x07\"\x02\x02\x88\x89" +
		"\x07n\x02\x02\x89\x8A\x07g\x02\x02\x8A\x8B\x07v\x02\x02\x8B\x8C\x07v\x02" +
		"\x02\x8C\x8D\x07g\x02\x02\x8D\x8E\x07t\x02\x02\x8E\x90\x07u\x02\x02\x8F" +
		"q\x03\x02\x02\x02\x8Fx\x03\x02\x02\x02\x8F\x83\x03\x02\x02\x02\x90\"\x03" +
		"\x02\x02\x02\x91\x92\x07c\x02\x02\x92\x93\x07d\x02\x02\x93\x94\x07d\x02" +
		"\x02\x94\x95\x07t\x02\x02\x95\x96\x07g\x02\x02\x96\x97\x07x\x02\x02\x97" +
		"\x98\x07k\x02\x02\x98\x99\x07c\x02\x02\x99\x9A\x07v\x02\x02\x9A\x9B\x07" +
		"k\x02\x02\x9B\x9C\x07q\x02\x02\x9C\xE9\x07p\x02\x02\x9D\x9E\x07h\x02\x02" +
		"\x9E\x9F\x07k\x02\x02\x9F\xA0\x07t\x02\x02\xA0\xA1\x07u\x02\x02\xA1\xA2" +
		"\x07v\x02\x02\xA2\xA3\x07\"\x02\x02\xA3\xA4\x07n\x02\x02\xA4\xA5\x07g" +
		"\x02\x02\xA5\xA6\x07v\x02\x02\xA6\xA7\x07v\x02\x02\xA7\xA8\x07g\x02\x02" +
		"\xA8\xA9\x07t\x02\x02\xA9\xE9\x07u\x02\x02\xAA\xAB\x07n\x02\x02\xAB\xAC" +
		"\x07c\x02\x02\xAC\xAD\x07u\x02\x02\xAD\xAE\x07v\x02\x02\xAE\xAF\x07\"" +
		"\x02\x02\xAF\xB0\x07n\x02\x02\xB0\xB1\x07g\x02\x02\xB1\xB2\x07v\x02\x02" +
		"\xB2\xB3\x07v\x02\x02\xB3\xB4\x07g\x02\x02\xB4\xB5\x07t\x02\x02\xB5\xE9" +
		"\x07u\x02\x02\xB6\xB7\x07o\x02\x02\xB7\xB8\x07k\x02\x02\xB8\xB9\x07f\x02" +
		"\x02\xB9\xBA\x07f\x02\x02\xBA\xBB\x07n\x02\x02\xBB\xBC\x07g\x02\x02\xBC" +
		"\xBD\x07\"\x02\x02\xBD\xBE\x07n\x02\x02\xBE\xBF\x07g\x02\x02\xBF\xC0\x07" +
		"v\x02\x02\xC0\xC1\x07v\x02\x02\xC1\xC2\x07g\x02\x02\xC2\xC3\x07t\x02\x02" +
		"\xC3\xE9\x07u\x02\x02\xC4\xC5\x07g\x02\x02\xC5\xC6\x07p\x02\x02\xC6\xC7" +
		"\x07f\x02\x02\xC7\xC8\x07\"\x02\x02\xC8\xC9\x07n\x02\x02\xC9\xCA\x07g" +
		"\x02\x02\xCA\xCB\x07v\x02\x02\xCB\xCC\x07v\x02\x02\xCC\xCD\x07g\x02\x02" +
		"\xCD\xCE\x07t\x02\x02\xCE\xE9\x07u\x02\x02\xCF\xD0\x07j\x02\x02\xD0\xD1" +
		"\x07q\x02\x02\xD1\xD2\x07o\x02\x02\xD2\xD3\x07q\x02\x02\xD3\xD4\x07r\x02" +
		"\x02\xD4\xD5\x07j\x02\x02\xD5\xD6\x07q\x02\x02\xD6\xD7\x07p\x02\x02\xD7" +
		"\xE9\x07g\x02\x02\xD8\xD9\x07t\x02\x02\xD9\xDA\x07g\x02\x02\xDA\xDB\x07" +
		"x\x02\x02\xDB\xDC\x07g\x02\x02\xDC\xDD\x07t\x02\x02\xDD\xDE\x07u\x02\x02" +
		"\xDE\xDF\x07c\x02\x02\xDF\xE9\x07n\x02\x02\xE0\xE1\x07t\x02\x02\xE1\xE2" +
		"\x07q\x02\x02\xE2\xE3\x07v\x02\x02\xE3\xE4\x07c\x02\x02\xE4\xE5\x07v\x02" +
		"\x02\xE5\xE6\x07k\x02\x02\xE6\xE7\x07q\x02\x02\xE7\xE9\x07p\x02\x02\xE8" +
		"\x91\x03\x02\x02\x02\xE8\x9D\x03\x02\x02\x02\xE8\xAA\x03\x02\x02\x02\xE8" +
		"\xB6\x03\x02\x02\x02\xE8\xC4\x03\x02\x02\x02\xE8\xCF\x03\x02\x02\x02\xE8" +
		"\xD8\x03\x02\x02\x02\xE8\xE0\x03\x02\x02\x02\xE9$\x03\x02\x02\x02\xEA" +
		"\xEC\t\x03\x02\x02\xEB\xEA\x03\x02\x02\x02\xEC\xED\x03\x02\x02\x02\xED" +
		"\xEB\x03\x02\x02\x02\xED\xEE\x03\x02\x02\x02\xEE&\x03\x02\x02\x02\x07" +
		"\x02.\x8F\xE8\xED\x03\b\x02\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!MorseGrammarLexer.__ATN) {
			MorseGrammarLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(MorseGrammarLexer._serializedATN));
		}

		return MorseGrammarLexer.__ATN;
	}

}

