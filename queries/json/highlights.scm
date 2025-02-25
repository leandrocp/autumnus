[
  (true)
  (false)
] @boolean

(null) @constant.builtin

(number) @number

(pair
  key: (string) @property)

(pair
  value: (string) @string)

(array
  (string) @string)

[
  ","
  ":"
] @punctuation.delimiter

[
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

("\"" @conceal
  (#set! conceal ""))

(escape_sequence) @string.escape

; FIXME: QueryError { row: 39, column: 0, offset: 0, message: "Wrong number of arguments to #eq? predicate. Expected 2, got 1.", kind: Predicate }
; ((escape_sequence) @conceal
;   (#eq? @conceal "\\\"")
;   (#set! conceal "\""))
