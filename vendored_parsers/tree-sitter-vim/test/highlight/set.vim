set hls!
" <- @keyword
"   ^^^ @variable.builtin
"      ^ @operator

set hls?
" <- @keyword
"   ^^^ @variable.builtin
"      ^ @operator

setlocal hls&
" <- @keyword
"        ^^^ @variable.builtin
"           ^ @operator

set laststatus=0
" <- @keyword
"   ^^^^^^^^^^ @variable.builtin
"             ^ @operator

" set omnifunc=v:lua.vim.lsp.omnifunc
