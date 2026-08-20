// update as needed, since ts is stupid as you can't import all without alias as you can in C
import { new_lexer } from './lexer.ts'; 
import { parse_node } from './parser.ts';


function main() : number
{
	const path : string = "example.txt";
	let text : string = Deno.readTextFileSync(path);
	if (!text)
		return 1;
	
	let lexer = new_lexer(path, text);
	let [node, ok] = parse_node(lexer);
	console.log(node);
}

main()