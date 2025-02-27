highlight
" <- @keyword

hi HiGroup
" <- @keyword
"     ^ @type

hi clear
" <- @keyword
"     ^ @keyword

hi clear HiGroup
" <- @keyword
"     ^ @keyword
"         ^ @type

hi HiGroup NONE
" <- @keyword
"     ^ @type
"           ^ @type
"
hi link first Second
" <- @keyword
"   ^ @keyword
"         ^ @type
"               ^ @type

hi default debugBreakpoint term=reverse ctermbg=red guibg=red
" <- @keyword
"     ^ @keyword
"             ^ @type
"                           ^ @property
"                                   ^ @constant
"                                           ^ @property
"                                                 ^ @constant
"                                                     ^ @property
"                                                           ^ @constant

hi default link HiGroup AnotherOne
" <- @keyword
"     ^ @keyword
"             ^ @keyword
"                 ^ @type
"                         ^ @type
