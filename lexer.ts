export enum TokenType 
{
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
};

export type Token = {
	kind : TokenType;
	text : string;
	path : string;
	row : number;
}

export type Lexer = {
	path : string;
	row : number;
	content : string;
	ind_stack : string[];
	tokens : Token[];
};

export function lexer_unnext(lexer : Lexer, token : Token) : void
{
	lexer.tokens.push(token);
	return;
}

export function new_lexer(path : string, content : string) : Lexer
{
	let lexer : Lexer = {path: path, row: 0, content: content, ind_stack: [""], tokens: [{kind: TokenType[TokenType.INDENT], text: "", path: path, row: 0}]}
	return lexer;
}

export function lexer_next(lexer : Lexer) : [Token, bool] // state modifying, return is 
{
	if (lexer.tokens.length > 0)
	{
		let token = lexer.tokens.pop();
		return [token, true];
	}
	while (true)
	{	
		if (lexer.content.length == 0)
		{
			while (lexer.ind_stack.length > 0)
			{
				lexer.ind_stack.pop();
				lexer.tokens.push({kind: TokenType[TokenType.DEDENT], text: "", path: lexer.path, row:lexer.row});
			}
			
			if (lexer.tokens.length > 0)
			{
				let token = lexer.tokens.pop();
				return [token, true];
			}
			return [{kind: TokenType[TokenType.END], text: "", path: lexer.path, row: lexer.row}, true];
		}
		
		lexer.row += 1;
		let [_, line, rest_content] = split_line(lexer.content);
		lexer.content = rest_content;
		let [indent, line_content] = split_indents(line);
		if (line_content.length == 0) continue; // empty lines or just spaces
		
		// process line
		if (indent == lexer.ind_stack[lexer.ind_stack.length-1])
		{
//			console.log(rest_content);
			let [token_stack, ok] = tokenize_line(lexer, line_content, []);
			if (token_stack.length == 0) continue; // probably a comment
			while (token_stack.length > 0)
			{
				let token = token_stack.pop();
				lexer.tokens.push(token);
			}
			return [lexer.tokens.pop(), true && ok]
			
		}
		else if (indent.startsWith(lexer.ind_stack[lexer.ind_stack.length-1]))
		{
			let [token_stack, ok] = tokenize_line(lexer, line_content, []);
			while (token_stack.length > 0)
			{
				let token = token_stack.pop();
				lexer.tokens.push(token);
			}
			
			lexer.ind_stack.push(indent);
			return [{kind: TokenType[TokenType.INDENT], text: "", path: lexer.path, row:lexer.row}, true && ok];
		}
		else if (lexer.ind_stack.includes(indent)) // i think this is a cheat lol
		{
			let [token_stack, ok] = tokenize_line(lexer, line_content, []);
			while (token_stack.length > 0)
			{
				let token = token_stack.pop();
				lexer.tokens.push(token);
			}
			
			while (indent != lexer.ind_stack[lexer.ind_stack.length-1])
			{
				lexer.ind_stack.pop();
				lexer.tokens.push({kind: TokenType[TokenType.DEDENT], text: "", path: lexer.path, row:lexer.row});
			}
			let token = lexer.tokens.pop();
			return [token, true && ok];
		}
		else
		{
			console.log("ERROR: uneven indents");
			return [null, false];
		}
		console.log("UNREACHABLE: lexer");
		return [null, false];
	}
}


export function tokenize_line(lexer: Lexer, line_content: string, token_stack: Token[]) : [Token[], boolean] // very terrible workaround. may need to redo
{
	let cursor : number = 0;
	line_content = line_content.trimStart();
	if (line_content.length == 0)
	{
		return [token_stack, true];
	}

	if (line_content[cursor] == ':')
	{
		cursor += 1;
		if (line_content[cursor] == ':')
		{
			cursor += 1;
			token_stack.push({kind: TokenType[TokenType.DOUBLE_COLON], text: "::", path: lexer.path, row: lexer.row})
			return tokenize_line(lexer, line_content.slice(cursor), token_stack);
		}
		if (line_content[cursor] == '=')
		{
			cursor += 1;
			token_stack.push({kind: TokenType[TokenType.COLON_EQUAL], text: ":=", path: lexer.path, row: lexer.row})
			return tokenize_line(lexer, line_content.slice(cursor), token_stack);
		}
		token_stack.push({kind: TokenType[TokenType.COLON], text: ":", path: lexer.path, row: lexer.row})
		return tokenize_line(lexer, line_content.slice(cursor), token_stack);
	}
	
	if (line_content[cursor] == '$')
	{
		cursor += 1;
		while (line_content[cursor] != '$')
		{
			cursor += 1;
			if (cursor == line_content.length) 
			{
				console.log("ERROR: unended MATH_EXP");
				return [token_stack, false];
			}
		}
		token_stack.push({kind: TokenType[TokenType.MATH_EXP], text: line_content.slice(1, cursor), path: lexer.path, row: lexer.row})
		cursor += 1;
		return tokenize_line(lexer, line_content.slice(cursor), token_stack);
	}
	
	if (line_content[cursor] == '(')
	{
		cursor += 1;
		token_stack.push({kind: TokenType[TokenType.LEFT_PAREN], text: "(", path: lexer.path, row: lexer.row})
		return tokenize_line(lexer, line_content.slice(cursor), token_stack);
	}
	
	if (line_content[cursor] == ')')
	{
		cursor += 1;
		if (line_content[cursor] == '>')
		{
			cursor += 1;
			token_stack.push({kind: TokenType[TokenType.PAREN_ARROW], text: ")>", path: lexer.path, row: lexer.row})
			return tokenize_line(lexer, line_content.slice(cursor), token_stack);
		}
		token_stack.push({kind: TokenType[TokenType.RIGHT_PAREN], text: ")", path: lexer.path, row: lexer.row})
		return tokenize_line(lexer, line_content.slice(cursor), token_stack);
	}
	
	if (line_content[cursor] == '>')
	{
		cursor += 1;
		if (line_content[cursor] == '(')
		{
			cursor += 1;
			token_stack.push({kind: TokenType[TokenType.ARROW_PAREN], text: ">(", path: lexer.path, row: lexer.row})
			return tokenize_line(lexer, line_content.slice(cursor), token_stack);
		}
	}
	
	
	if (is_symbol(line_content[cursor]))
	{
		while (cursor < line_content.length && is_symbol(line_content[cursor]))
		{
			cursor += 1;
		}
		token_stack.push({kind: TokenType[TokenType.SYMBOL], text: line_content.slice(0, cursor), path: lexer.path, row: lexer.row})
		return tokenize_line(lexer, line_content.slice(cursor), token_stack);
	}
		
	if (line_content[cursor] == '|')
	{
		cursor += 1;
		token_stack.push({kind: TokenType[TokenType.VERT_BAR], text: "|", path: lexer.path, row: lexer.row})
		return tokenize_line(lexer, line_content.slice(cursor), token_stack);
	}
	
	if (line_content[cursor] == '/')
	{
		cursor += 1;			
		if (line_content[cursor] == '/')
		{
			return [token_stack, true]
		}
	}
	
	// NOTE(kt): more still unimplemented
	console.log(`unknown thing \"${line_content[cursor]}\": probably still unimplemented`);
	cursor += 1
	return tokenize_line(lexer, line_content.slice(cursor), token_stack);
}


// helper functions
export function split_line(text : string) : [boolean, string, string]
{
//	// should really be a char
//	if (delim.length != 1) return [false, text, ""];
	
	let split_ind : number = text.indexOf('\n');
	if (split_ind == -1) return [false, text, ""]
	return [true, text.slice(0, split_ind), text.slice(split_ind+1, text.length-1)];
}

export function split_indents(line : string) : [string, string]
{
	let count : number = 0;
	while (count < line.length)
	{
		let ch : string = line[count]
		if (ch != ' ' && ch != '\t')
		{
			break;
		}
		count += 1;
	}
	return [line.slice(0, count), line.slice(count, line.length).trim()];
}

export function is_symbol_start(x : string) : boolean
{
	return /^[_A-Za-z]$/.test(x);
}

export function is_symbol(x : string) : boolean
{
	return /^[_A-Za-z0-9]$/.test(x);
}

