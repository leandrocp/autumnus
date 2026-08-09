; Upstream nvim-treesitter matches option values with
; `(#lua-match? @number "^[%d]+(%.[%d]+)?$")`, but Lua patterns cannot quantify a
; capture: the `?` after `)` is a literal, so that predicate matches nothing in
; Neovim either. Verified with `string.find("42", "^[%d]+(%.[%d]+)?$")` -> nil.
;
; Add a working equivalent instead of overriding the whole upstream file.
((set_value) @number
  (#lua-match? @number "^[%d]+%.?[%d]*$"))
