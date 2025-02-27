set breakpoint pending on
b tree_sitter_vim_external_scanner_scan
r parse test.vim
display (char)lexer->lookahead
display *valid_symbols@(TOKENTYPE_NR)
