; This file is auto-generated. Do not edit.
; TOON highlight query tuned for lumis and aligned to the
; 3swordman/tree-sitter-toon grammar.

; Keys and field names
(unquoted_key) @property

(field_name
  (unquoted_key) @property)

(field_name
  (string) @property)

(pair
  key: (key
    (string) @property))

; Literals
[(null)] @constant.builtin
(boolean) @boolean
(number) @number

; Strings
(string) @string
(unquoted_string) @string
(escape_sequence) @string.escape

; Array header lengths
(header
  length: (number) @number)

; Brackets and braces
[
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

; Delimiters and separators
[
  (delimiter)
  ","
  "|"
  ":"
  "\""
] @punctuation.delimiter

; List markers
"-" @punctuation.special
