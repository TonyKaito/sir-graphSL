# sir-graphSL
Small directed graph (and circuit analysis) scripting language. Mostly needed for visualizations and note taking (though will add basic computations soon).

**STILL UNFINISHED AND EXPERIMENTAL:** no guarantee of quality. feel free to modify as needed. this project is moreso akin to a proof-of-concept than a fully fledged language of many capabilities

### Demo (of unfinished product)
![](https://github.com/TonyKaito/sir-graphSL/blob/main/demo_01.gif)

### Current Grammar
```
// program | code_block
//         ;
// 
// code_block | INDENT { statement } DEDENT
//            ;
// 
// obj_dec | :: SYMBOL code_block
//         ;
// 
// statement | SYMBOL ( obj_dec || graph_statement || tag_statement)
//           ;
// 
// graph_statement | ARROW_PAREN SYMBOL PAREN_ARROW SYMBOL [ DOUBLE_COLON SYMBOL ] [ VERT_BAR SYMBOL ]
//                 ;
// 
// tag_statement | [ LEFT_PAREN SYMBOL RIGHT_PAREN ] := ( SYMBOL || MATH_EXP )
//               ;
```
##### Example file
```
ex1 :: graph
  start >(i1)> mid | only_move
  
ex1 :: tag
  start := $\text{poggers}$
  i1 := $\text{what was i thinking}$

ex2 :: circ
  G >(i1)> 1 :: cur_src
  1 >(g3)> G :: res
  1 >(g1)> 2 :: res
  2 >(g2)> G :: res
  
ex2 :: tag
  i1 := input
  g2 := output
  G := ground

ex2 :: eq 
  i1 (t) := $10 * u(t)$
  i1 (s) := $10 / s$
```


Initial lexer and parser inspired off of: https://www.youtube.com/watch?v=9wAFshF7Pu4
