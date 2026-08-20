import { lexer_next, lexer_unnext, TokenType } from './lexer.ts';

export enum NodeKind
{
	LINE,
	BLOCK
}

// NOTE(kt): terrible tagged union workaround...?
export type Node = 
| {
	kind : NodeKind[NodeKind.LINE];
	line : string
} 
| {
	kind : NodeKind[NodeKind.BLOCK];
	block : Node[];
};


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
		case TokenType[TokenType.LINE]: 
		{
			return [{kind: NodeKind[NodeKind.LINE], line: token.line}, true];
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
			console.log("ERROR: unexpected dedent");
			return [null, false];
		} break;
		default:
		{
			console.log("ERROR: UNREACHABLE");
			return [null, false];
		}
	}
}