for i in foo
" <- @keyword.repeat
"   ^ @variable
"     ^^ @keyword.repeat
"        ^^^ @variable
  if i.bar
  " <- @keyword.conditional
  "  ^ @variable
  "   ^ @punctuation.delimiter
  "    ^^^ @variable
    break
    " <- @keyword.repeat
  endif
  " <- @keyword.conditional
  continue
  " <- @keyword.repeat
endfor
" <- @keyword.repeat

while v:false
" <- @keyword.repeat
"       ^^^^^ @boolean
endwhile
" <- @keyword.repeat
