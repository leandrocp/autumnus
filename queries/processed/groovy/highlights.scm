; This file is auto-generated. Do not edit.
[
  "assert"
  "extends"
  "instanceof"
  "package"
] @keyword

"class" @keyword.type

[
  "as"
  "in"
] @keyword.operator

[
  "case"
  "default"
  "else"
  "if"
  "switch"
] @keyword.conditional

[
  "catch"
  "finally"
  "try"
] @keyword.exception

"def" @keyword.function

"import" @keyword.import

[
  "for"
  "while"
  "break"
  "continue"
] @keyword.repeat

"return" @keyword.return

[
  (true)
  (false)
] @boolean

(null_literal) @constant.builtin

(this) @variable.builtin

[
  "int"
  "char"
  "short"
  "long"
  "float"
  "double"
] @type.builtin

[
  "final"
  "private"
  "protected"
  "public"
  "static"
  "synchronized"
] @keyword.modifier

[(line_comment) (block_comment)] @comment

(shebang) @keyword.directive

(string_literal) @string

(string_literal
  (escape_sequence) @string.escape)

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ":"
  ","
  "."
] @punctuation.delimiter

(identifier) @variable

((identifier) @constant
  (#match? @constant "^[A-Z][A-Z_]+"))

[
  "%"
  "*"
  "/"
  "+"
  "-"
  "<<"
  ">>"
  ">>>"
  ".."
  "<"
  "<="
  ">"
  ">="
  "=="
  "!="
  "&"
  "^"
  "|"
  "&&"
  "||"
  "++"
  "--"
  "!"
] @operator

(asterisk) @character.special

(map_literal
  (map_item
    key: (identifier) @variable.parameter))

(formal_parameter
  type: (_) @type
  name: (identifier) @variable.parameter)

(function_definition
  type: (_) @type)

(method_declaration
  type: (_) @type)

(class_declaration
  name: (identifier) @type)

(method_invocation
  name: (identifier) @function)

(juxt_function_call
  name: (identifier) @function)

(function_definition
  name: (identifier) @function)

(method_declaration
  name: (identifier) @function)

(annotation) @function.macro

(annotation
  name: (identifier) @function.macro)

"@interface" @function.macro