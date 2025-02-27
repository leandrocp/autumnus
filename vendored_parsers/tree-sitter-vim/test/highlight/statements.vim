let a = "foo"
" <- @keyword
"   ^ @variable
"         ^ @string


let a{b + 10} = a:bar
"       ^ @operator
"         ^ @number
"               ^ @module

cnext
" <- @keyword

cNext
" <- @keyword

cprevious
" <- @keyword


unknowncommand
" <- @keyword
