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
	value : {kind : TokenType[TokenType.SYMBOL], text : string} | {kind : TokenType[TokenType.MATH_EXP], eq : string}; // either symbol or math_exp
}
| {
	kind : NodeKind[NodeKind.GRAPH_STMT];
	source : string;
	morphism : string;
	dest : string;
	dtype : string;
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
			
			console.log("NOTE(kt): UNREACHABLE: token.kind Indent");
			return [null, false];
		} break;
		case TokenType[TokenType.DEDENT]: 
		{
			console.log("ERROR: unexpected DEDENT");
			return [null, false];
		} break;
		case TokenType[TokenType.SYMBOL]: 
		{
			let statement : Node;
			let var_name : string = token.text;
			[token, ok] = lexer_next(lexer);
			if (!ok) return [null, false];
			switch (token.kind)
			{
				case TokenType[TokenType.DOUBLE_COLON]:
				{
					statement = {kind: NodeKind[NodeKind.OBJ_DEC], name: var_name, dtype: "" , block: []};
					
					[token, ok] = lexer_next(lexer);
					if (!ok) return [null, false];
					if (!is_keyword(token)) return [null, false];
					statement.dtype = token.text;
					
					// console.log("succ1");
					return [statement, true];
				} break;
				case TokenType[TokenType.ARROW_PAREN]:
				{
					statement = {kind: NodeKind[NodeKind.GRAPH_STMT], source: var_name, morphism: "", dest: "", dtype: "", init_tag: ""};
					
					([token, ok] = lexer_next(lexer));
					if (!ok) return [null, false];
					if (!is_variable(token)) return [null, false];
					statement.morphism = token.text;
					
					[token, ok] = lexer_next(lexer);
					if (!ok) return [null, false];
					if (token.kind != TokenType[TokenType.PAREN_ARROW]) return [null, false];
					
					[token, ok] = lexer_next(lexer);
					if (!ok) return [null, false];
					if (!is_variable(token)) return [null, false];
					statement.dest = token.text;
	
					[token, ok] = lexer_next(lexer);
					if (!ok) return [null, false];
					if (token.kind == TokenType[TokenType.SYMBOL] || token.kind == TokenType[TokenType.DEDENT])
					{
						lexer_unnext(lexer, token);
						// console.log("succ2a");
						return [statement, true];
					}
					else if (token.kind == TokenType[TokenType.VERT_BAR])
					{
						[token, ok] = lexer_next(lexer);
						if (!ok) return [null, false];
						if (!is_variable(token)) return [null, false];
						statement.init_tag = token.text;
						// console.log("succ2b");
						return [statement, true];
					}
					else if (token.kind == TokenType[TokenType.DOUBLE_COLON])
					{
						[token, ok] = lexer_next(lexer);
						if (!ok) return [null, false];
						if (!is_variable(token)) return [null, false];
						statement.dtype = token.text;
						
						[token, ok] = lexer_next(lexer);
						if (!ok) return [null, false];
						if (token.kind == TokenType[TokenType.SYMBOL] || token.kind == TokenType[TokenType.DEDENT])
						{
							lexer_unnext(lexer, token);
							// console.log("succ2c");
							return [statement, true];
						}
						else if (token.kind == TokenType[TokenType.VERT_BAR])
						{
							[token, ok] = lexer_next(lexer);
							if (!ok) return [null, false];
							if (!is_variable(token)) return [null, false];
							statement.init_tag = token.text;
							// console.log("succ2d");
							return [statement, true];
						}
						else {
							console.log(token);
							console.log(`ERROR: unexpected token: ${token.text}`);
							return [null, false];
						}
					}
					else {
						console.log(token);
						console.log(`ERROR: unexpected token: ${token.text}`);
						return [null, false];
					}
				} break;
				case TokenType[TokenType.LEFT_PAREN]:
				{
					statement = {kind : NodeKind[NodeKind.TAG_STMT], obj : var_name, param : "", value : {}};
					
					[token, ok] = lexer_next(lexer);
					if (!ok) return [null, false];
					if (!is_variable(token)) return [null, false];
					statement.param = token.text;
					
					[token, ok] = lexer_next(lexer);
					if (!ok) return [null, false];
					if (token.kind != TokenType[TokenType.RIGHT_PAREN]) return [null, false];
					
					[token, ok] = lexer_next(lexer);
					if (!ok) return [null, false];
					if (token.kind != TokenType[TokenType.COLON_EQUAL]) return [null, false];
					// console.log(`NOTE(kt): not yet done, LEFT_PAREN: ${token.text}`);
					// return [null, false];
				} // intentional bleed through, as these are the same case
				case TokenType[TokenType.COLON_EQUAL]:
				{
					if (!statement) statement = {kind : NodeKind[NodeKind.TAG_STMT], obj : var_name, param : "", value : {}};
					
						[token, ok] = lexer_next(lexer);
						if (!ok) return [null, false];
						if (token.kind == TokenType[TokenType.MATH_EXP])
						{
							// console.log("succ3a");
							statement.value = {kind: TokenType[TokenType.MATH_EXP], eq: token.text};
							return [statement, true];
						}
						else if (is_variable(token))
						{
							// console.log("succ3b");
							statement.value = {kind: TokenType[TokenType.SYMBOL], text: token.text};
							return [statement, true];
						}
						else {
							console.log(`ERROR: unexpected token: ${token.text}`);
							return [null, false];
						}
						
					console.log(`ERROR: unexpected token: ${token.text}`);
					return [null, false];
				} break;
				default:
				{
					console.log(`ERROR: unexpected token: ${token.text}`);
					return [null, false];
				}
			
			console.log(`NOTE(kt): not yet done, symbol: ${token.text}`);
			return [null, false];
			}
		} break;
		case TokenType[TokenType.MATH_EXP]: 
		{
			console.log(`ERROR: unexpected expression: ${token.text}`);
			return [null, false];
		} break;
		default:
		{
			console.log("ERROR: UNREACHABLE: token.kind default");
			return [null, false];
		}
	}
}

export function is_variable(token : TokenType) : bool
{
	return token.kind == TokenType[TokenType.SYMBOL] && !is_keyword(token);
}

export function is_keyword(token: TokenType) : bool
{
	return (token.kind == TokenType[TokenType.SYMBOL]) && ((token.text == 'graph') || (token.text == 'circ') || (token.text == 'tag') || (token.text == 'eq') || (token.text == 'act'))
}