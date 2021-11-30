grammar MorseGrammar;

WS: [ \t\n\r]+ -> skip;
DEFINITION_SPLIT: '->';
OPEN_BRACKET: '(';
CLOSE_BRACKET: ')';
WORD_JOIN: '+';
EQUALS: '=';
INTO: 'into';
FROM: 'from';

ANAGRAM: 'anagram';
HYPONYM: 'hyponym';
DUPLICATE: 'duplicate';
INSERT: 'insert';
SUBTRACT: 'subtract';

SIMPLE_OPERATION: 'charade' | 'odd letters' | 'even letters';
COMPLEX_OPERATION:
	'abbreviation'
	| 'first letters'
	| 'last letters'
	| 'middle letters'
	| 'end letters'
	| 'homophone'
	| 'reversal'
	| 'rotation';

WORD: [a-zA-Z<>0-9\-]+;

multiWord: WORD+;
subject: '[' multiWord ']';

explanation:
	explanation EQUALS explanation														# synonym
	| explanation (WORD_JOIN explanation)+												# wordJoin
	| ANAGRAM subject explanation?														# anagram
	| SIMPLE_OPERATION subject															# simpleOperation
	| COMPLEX_OPERATION subject explanation												# complexOperation
	| multiWord OPEN_BRACKET explanation+ CLOSE_BRACKET									# wordExplanation
	| HYPONYM subject explanation EQUALS explanation									# hyponym
	| DUPLICATE subject OPEN_BRACKET explanation WORD_JOIN explanation CLOSE_BRACKET	# duplicate
	| INSERT subject explanation INTO explanation										# insert
	| SUBTRACT subject explanation FROM explanation										# subtract
	| multiWord																			# word;

fullExplanation:
	multiWord DEFINITION_SPLIT subject? explanation;