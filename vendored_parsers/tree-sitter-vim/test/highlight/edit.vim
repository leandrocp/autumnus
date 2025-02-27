edit
" <- @keyword

edit!
" <- @keyword
"   ^ @punctuation.special

edit ++ff=dos + filename.txt
" <- @keyword
"    ^^^^ @property
"           ^ @constant
"             ^ @operator
"                 ^ @string.special.path

edit ++bad=A ++nobinary #1
" <- @keyword
"       ^ @property
"               ^ @property
"                        ^ @number

ex
" <- @keyword

ex ++encoding=latin1 +3 filename
" <- @keyword
"     ^ @property
"               ^ @constant
"                    ^ @operator
"                     ^ @number
"                         ^ @string.special.path

enew!
" <- @keyword
"   ^ @punctuation.special

find filename
" <- @keyword
"     ^ @string.special.path

find! ++bad=keep another\ filename
" <- @keyword
"   ^ @punctuation.special
"       ^ @property
"             ^ @constant
"                ^^^^^^^^^^^^^^^^^ @string.special.path

vi
" <- @keyword

visual! ++binary
" <- @keyword
"     ^ @punctuation.special
"         ^ @property

visual filename
" <- @keyword
"       ^ @string.special.path

vie +/pattern_to_check_against filename
" <- @keyword
"   ^ @operator
"       ^ @string.special
"                               ^ @string.special.path

view! banged_filename
" <- @keyword
"   ^ @punctuation.special
"       ^ @string.special.path
