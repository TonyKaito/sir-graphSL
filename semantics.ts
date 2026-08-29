import { NodeKind } from './parser.ts';

type Error = {
	msg: str
}

export function check_semantics(root_node : Node) : [string[], Error[]]
{
	let errors : Error[] = [];
	let scope = [];
	walk(root_node, errors, scope, "");
	return [scope, errors];
}

export function walk(node : Node, errors : Error[], scope: string[], parent_dtype : string) : Error[]
{
	switch(node.kind)
	{
		case NodeKind[NodeKind.OBJ_DEC]:
		{
			let [index, found] = name_in_scope(node, scope)
			if (found)
			{
				scope[index][node.dtype] = {}
			}
			else
			{
				scope.push({"name": node.name})
				scope[scope.length-1][node.dtype] = {};
			}
			
			walk(node.block, errors, scope, node.dtype);
		} break;
		case NodeKind[NodeKind.BLOCK]:
		{
//			scope.push({})
			for (let i = 0; i < node.block.length; ++i)
			{
				walk(node.block[i], errors, scope, parent_dtype);
			}
		} break;
		case NodeKind[NodeKind.TAG_STMT]:
		{
			if (parent_dtype && parent_dtype !== "tag" && parent_dtype !== "eq")
				errors.push({msg : "Expected 'tag' or 'eq' statement in 'tag' or 'eq' block"});
			else
			{
				scope[scope.length-1][parent_dtype][node.obj] = {"param": node.param, "value": node.value}
			}
		} break;
		case NodeKind[NodeKind.GRAPH_STMT]:
		{
			if (parent_dtype && parent_dtype !== "graph" && parent_dtype !== "circ")
				errors.push({msg : "Expected 'graph' or 'circ' statement in 'graph' or 'circ' block"});
			else
			{
				if (!("node" in scope[scope.length-1][parent_dtype]))
					scope[scope.length-1][parent_dtype]["node"] = [];
				
				if (!("conn" in scope[scope.length-1][parent_dtype]))
					scope[scope.length-1][parent_dtype]["conn"] = [];
				
				let n1 = push_if_not_exists(scope[scope.length-1][parent_dtype]["node"], node.source);
				let n2 = push_if_not_exists(scope[scope.length-1][parent_dtype]["node"], node.dest);
				
				console.log(`>>>>>${n1}  ${n2}<<<<<<<<<`)
				push_if_not_exists(scope[scope.length-1][parent_dtype]["conn"], {"name": node.morphism, "vertices": [n1, n2], "dtype": node.dtype});
				
			}
		} break;
		default:
		{
			console.log("ERROR: unreachable");
			errors.push({msg : "ERROR: unreachable"});
		}
	}
	return
}

function name_in_scope(node : Node, scope : string[]) : [number, boolean]
{
	for (let i = 0; i < scope.length; ++i)
	{
		if (scope[i]["name"] == node.name)
			return [i, true];
	}
	return [-1, false];
}

function push_if_not_exists(arr : string[], thing : string) : number
{
	let index = arr.indexOf(thing);
	console.log("================");	
	console.log(arr, thing, index);
	console.log("================");
	
	if (index == -1)
	{
		arr.push(thing);
		return arr.length-1;
	}
	return index;
}