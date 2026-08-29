// update as needed, since ts is stupid as you can't import all without alias as you can in C
import { new_lexer } from './lexer.ts'; 
//import { new_lexer, lexer_next, TokenType } from './lexer.ts'; 
import { parse_node } from './parser.ts';
import { check_semantics } from './semantics.ts';


function main() : number
{
	const path : string = "example.txt";
	let text : string = Deno.readTextFileSync(path);
	if (!text)
		return 1;
	
	let lexer = new_lexer(path, text);
	let [node, ok] = parse_node(lexer);
	let [objects, errors] = check_semantics(node);
	
	if (errors.length == 0)
	{
		const output : string = "result.json";
		Deno.writeTextFileSync(output, JSON.stringify(objects, null, 2));
	}
	else
	{
		console.log("ERRORS WERE FOUND");
		console.log(errors);
	}
	
//	while (true)
//	{
//		let [token, ok] = lexer_next(lexer);
//		if (!ok) return;
//		console.log(token);
//		if (token.kind == TokenType[TokenType.END]) break;
//	}
}

main()