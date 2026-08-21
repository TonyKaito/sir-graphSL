import { lexer_next, lexer_unnext, TokenType } from './lexer.ts';

export enum NodeKind
{
	TAG_STMT,
	GRAPH_STMT,
	OBJ_DEC,
	BLOCK
}

// NOTE(kt): terrible tagged union workaround...?
export type Node = 
| {
	kind : NodeKind[NodeKind.OBJ_DEC];
	name : string;
	dtype : string;
	block : Node; // should be block node
} 
| {
	kind : NodeKind[NodeKind.BLOCK];
	block : Node[];
}
| {
	kind : NodeKind[NodeKind.TAG_STMT];
	obj : string;
	param : string;
	value : {kind : TokenType[TokenType.SYMBOL], text : string} | {kind : TokenType[TokenType.SYMBOL], eq : string}; // either symbol or math_exp
}
| {
	kind : NodeKind[NodeKind.GRAPH_STMT];
	source : string;
	morphism : string;
	dest : string;
	init_tag : string;
};


/*
	COLON,
	DOUBLE_COLON,
	COLON_EQUAL,
	LEFT_PAREN,
	RIGHT_PAREN,
	ARROW_PAREN,
	PAREN_ARROW,
	VERT_BAR,
	MATH_EXP,
	SYMBOL,
	INDENT,
	DEDENT,
	END
*/

export function parse_node(lexer : Lexer) : [Node, boolean]
{
	let [token, ok] = lexer_next(lexer);
	if (!ok) return [null, false];
	
	switch (token.kind)
	{
		case TokenType[TokenType.END]: 
		{
			console.log("ERROR: unexpected end of file");
			return [null, false];
		} break;
		case TokenType[TokenType.INDENT]: 
		{
			let parent, child : Node;
			parent = {kind: NodeKind[NodeKind.BLOCK], block: []};
			while (true)
			{
				[token, ok] = lexer_next(lexer);
				if (!ok) return [null, false];
				if (token.kind == TokenType[TokenType.DEDENT]) return [parent, true];
				lexer_unnext(lexer, token);
				[child, ok] = parse_node(lexer);
				if (!ok) return [null, false];
				parent.block.push(child);
			}
			
			console.log("NOTE(kt): UNREACHABLE");
			return [null, false];
		} break;
		case TokenType[TokenType.DEDENT]: 
		{
			console.log("ERROR: unexpected DEDENT");
			return [null, false];
		} break;
		case TokenType[TokenType.COLON]: 
		{
			console.log("NOTE(kt): not yet done, ':'");
			return [null, false];
		} break;
		case TokenType[TokenType.DOUBLE_COLON]: 
		{
			console.log("NOTE(kt): not yet done, '::'");
			return [null, false];
		} break;
		case TokenType[TokenType.COLON_EQUAL]: 
		{
			console.log("NOTE(kt): not yet done, ':='");
			return [null, false];
		} break;
		case TokenType[TokenType.LEFT_PAREN]: 
		{
			console.log("NOTE(kt): not yet done, '('");
			return [null, false];
		} break;
		case TokenType[TokenType.RIGHT_PAREN]: 
		{
			console.log("NOTE(kt): not yet done, ')'");
			return [null, false];
		} break;
		case TokenType[TokenType.ARROW_PAREN]: 
		{
			console.log("NOTE(kt): not yet done, '>(");
			return [null, false];
		} break;
		case TokenType[TokenType.PAREN_ARROW]: 
		{
			console.log("NOTE(kt): not yet done, ':)>");
			return [null, false];
		} break;
		case TokenType[TokenType.VERT_BAR]: 
		{
			console.log("NOTE(kt): not yet done, '|'");
			return [null, false];
		} break;
		case TokenType[TokenType.SYMBOL]: 
		{
			
			console.log(`NOTE(kt): not yet done, symbol: ${token.text}`);
			return [null, false];
		} break;
		case TokenType[TokenType.MATH_EXP]: 
		{
			console.log(`NOTE(kt): not yet done, math expression: ${token.text}`);
			return [null, false];
		} break;
		default:
		{
			console.log("ERROR: UNREACHABLE");
			return [null, false];
		}
	}
}