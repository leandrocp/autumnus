; This file is auto-generated. Do not edit.
(full_ident
  (identifier) @variable)

(full_ident
  (identifier)
  (identifier) @variable.member)

(field
  (identifier) @property)

(field_option
  (identifier) @property)

(enum_value_option
  (identifier) @property)

(block_lit
  (identifier) @property)

[
  "extend"
  "extensions"
  "oneof"
  "option"
  "reserved"
  "syntax"
  "edition"
  "to"
  "max"
] @keyword

[
  "enum"
  "service"
  "message"
  "map"
] @keyword.type

"rpc" @keyword.function

"returns" @keyword.return

[
  "optional"
  "repeated"
  "required"
  "stream"
] @keyword.modifier

[
  "package"
  "import"
] @keyword.import

[
  (key_type)
  (type)
  (message_name)
  (enum_name)
  (service_name)
  (rpc_name)
  (message_or_enum_type)
] @type

(enum_field
  (identifier) @constant)

(string) @string

[
  "\"proto3\""
  "\"proto2\""
] @string.special

(escape_sequence) @string.escape

(int_lit) @number

(float_lit) @number.float

[
  (true)
  (false)
] @boolean

(comment) @comment @spell

((comment) @comment.documentation
  (#match? @comment.documentation "^/[*][*][^*][\\s\\S]*[*]/$"))

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
  "<"
  ">"
] @punctuation.bracket

[
  ";"
  ","
  "."
  ":"
] @punctuation.delimiter

[
  "="
  "-"
  "+"
] @operator
