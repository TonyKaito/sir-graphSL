function split_indents(line : string) : [string, string]
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

function parse_node_block(lines: string[], node_block: Node[], block_indent: string) : boolean
{
	let ind_stack : string[] = [""];
	
	for (let i : number = 0; i < lines.length; ++i)
	{
		let line : string = lines[i]
		let [indent, content] = split_indents(line);
		if (content.length == 0) continue; // empty lines or just spaces
		
		if (indent == ind_stack[ind_stack.length-1])
		{
			console.log(`LINE: ${content}`);
		}
		else if (indent.startsWith(ind_stack[ind_stack.length-1]))
		{
			ind_stack.push(indent);
			console.log("INDENT");
			console.log(`LINE: ${content}`);
		}
		else if (ind_stack.includes(indent)) // i think this is a cheat lol
		{
			while (indent != ind_stack[ind_stack.length-1])
			{
				console.log("DEDENT");
				ind_stack.pop();
			}
			console.log(`LINE: ${content}`);
		}
		else
		{
			console.log("ERROR: uneven indents");
			return false;
		}
	}
	
	while (ind_stack.length > 1) // we don't care about the first element
	{
		console.log("DEDENT");
		ind_stack.pop();	
	}
	return true;
}

function main() : number
{
	const path : string = "example.txt";
	let text : string = Deno.readTextFileSync(path);
	if (!text)
		return 1;
		
	let lines = text.split(/\r?\n/);
//	let lazer = {text: lines, path: path, line: 0}
	
	let node_block : Node[];
	if (!parse_node_block(lines, node_block, "")) return 1;
	
	return 0;
}

main()