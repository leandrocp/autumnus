command
" <- @keyword

com
" <- @keyword

command UserCommand
" <- @keyword
"         ^ @function.macro

command -complete=buffer UserCommand echo "toto"
" <- @keyword
"           ^ @property
"                   ^ @constant
"                           ^ @function.macro
"                                     ^^^^^^^^^^ @string

command -complete=arglist UserCommand echo
" <- @keyword
"           ^ @property
"                   ^ @constant
"                           ^ @function.macro
"                                     ^ @string

command -addr=lines -addr=arguments -addr=buffers -addr=loaded_buffers UserCommand echo
" <- @keyword
"           ^ @property
"               ^ @constant
"                      ^ @property
"                          ^ @constant
"                                     ^ @property
"                                         ^ @constant
"                                                     ^ @property
"                                                         ^ @constant
"                                                                          ^ @function.macro
"                                                                                    ^ @string
"
command -addr=windows -addr=tabs -addr=quickfix -addr=other  UserCommand echo
" <- @keyword
"           ^ @property
"               ^ @constant
"                      ^ @property
"                             ^ @constant
"                                   ^ @property
"                                       ^ @constant
"                                                 ^ @property
"                                                     ^ @constant
"                                                                ^ @function.macro
"                                                                          ^ @string
"

command -range=% UserCommand echo
" <- @keyword
"           ^ @property
"              ^ @string.regexp
"                   ^ @function.macro
"                             ^ @string

command -range=12 UserCommand echo
" <- @keyword
"           ^ @property
"              ^ @number
"                   ^ @function.macro
"                             ^ @string

command -range UserCommand echo
" <- @keyword
"           ^ @property
"                 ^ @function.macro
"                           ^ @string

command -count UserCommand echo
" <- @keyword
"           ^ @property
"                 ^ @function.macro
"                           ^ @string
command -count UserCommand echo
" <- @keyword
"           ^ @property
"                 ^ @function.macro
"                           ^ @string

command -nargs=* -nargs=1 -nargs=? -nargs=+ UserCommand echo
" <- @keyword
"           ^ @property
"              ^ @string.regexp
"                    ^ @property
"                       ^ @number
"                            ^ @property
"                                ^ @string.regexp
"                                     ^ @property
"                                         ^ @string.regexp
"                                               ^ @function.macro
"                                                         ^ @string

command -buffer -bar -bang -keepscript -register UserCommand echo
" <- @keyword
"           ^ @property
"                 ^ @property
"                             ^ @property
"                                         ^ @property
"                                                  ^ @function.macro
"                                                            ^ @string

" command UserCommand call Test()

" command -complete=syntax ToggleSyntax if exists("g:syntax_on") | syntax off | else | syntax enable | endif

" command -nargs=1 -complete=mapping Show echo "this is an error message"

" com -complete=custom,funcName -buffer -addr=tabs -bang ShowFunc execute "echo 'this is another error message'"
