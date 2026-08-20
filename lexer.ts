export enum TokenType 
{
	LINE,
	INDENT,
	DEDENT,
	END
};

export type Token = {
	kind : TokenType;
	line : string;
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

// helper function
export function split_left(text : string, delim : string) : [boolean, string, string]
{
	// should really be a char
	if (delim.length != 1) return [false, text, ""];
	
	let split_ind : number = text.indexOf(delim);
	if (split_ind == -1) return [false, text, ""]
	return [true, text.slice(0, split_ind), text.slice(split_ind+1, text.length-1)];
}

export function lexer_unnext(lexer : Lexer, token : Token) : void
{
	lexer.tokens.push(token);
	return;
}

export function new_lexer(path : string, content : string) : Lexer
{
	let lexer : Lexer = {path: path, row: 0, content: content, ind_stack: [""], tokens: [{kind: TokenType[TokenType.INDENT], line: "", path: path, row: 0}]}
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
			while (lexer.ind_stack.length > 0) // we don't care about the first element
			{
				lexer.ind_stack.pop();
				lexer.tokens.push({kind: TokenType[TokenType.DEDENT], line: "", path: lexer.path, row:lexer.row});
			}
			
			if (lexer.tokens.length > 0)
			{
				let token = lexer.tokens.pop();
				return [token, true];
			}
			return [{kind: TokenType[TokenType.END], line: "", path: lexer.path, row: lexer.row}, true];
		}
		
		lexer.row += 1;
		let [_, line, rest_content] = split_left(lexer.content, '\n');
		lexer.content = rest_content;
		let [indent, line_content] = split_indents(line);
		if (line_content.length == 0) continue; // empty lines or just spaces
		
		// process line
		if (indent == lexer.ind_stack[lexer.ind_stack.length-1])
		{
//			console.log(rest_content);
			return [{kind: TokenType[TokenType.LINE], line: line_content, path: lexer.path, row:lexer.row}, true];
		}
		else if (indent.startsWith(lexer.ind_stack[lexer.ind_stack.length-1]))
		{
			lexer.tokens.push({kind: TokenType[TokenType.LINE], line: line_content, path: lexer.path, row:lexer.row});
			lexer.ind_stack.push(indent);
			return [{kind: TokenType[TokenType.INDENT], line: "", path: lexer.path, row:lexer.row}, true];
		}
		else if (lexer.ind_stack.includes(indent)) // i think this is a cheat lol
		{
			lexer.tokens.push({kind: TokenType[TokenType.LINE], line: line_content, path: lexer.path, row:lexer.row});
			
			while (indent != lexer.ind_stack[lexer.ind_stack.length-1])
			{
				lexer.ind_stack.pop();
				lexer.tokens.push({kind: TokenType[TokenType.DEDENT], line: "", path: lexer.path, row:lexer.row});
			}
			let token = lexer.tokens.pop();
			return [token, true];
		}
		else
		{
			console.log("ERROR: uneven indents");
			return [null, false];
		}
		console.log("UNREACHABLE");
		return [null, false];
	}
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