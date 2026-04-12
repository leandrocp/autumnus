(identifier) @variable

[
  "datasource"
  "generator"
  "model"
] @keyword

"enum" @keyword.type

(comment) @comment @spell

(document_comment) @comment.documentation @spell

(field_type) @type

(attribute_specifier) @attribute

(apply_function) @function

(string) @string
(string_char_escape) @string.escape
(integer) @number
(boolean) @boolean
(special_constant) @constant.builtin

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  "="
  "@"
  ":"
  "?"
] @operator
