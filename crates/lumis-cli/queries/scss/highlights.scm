; This file is auto-generated. Do not edit.
; inherits: css
[
  "@media"
  "@charset"
  "@namespace"
  "@supports"
  "@keyframes"
  (at_keyword)
] @keyword.directive

"@import" @keyword.import

[
  (to)
  (from)
] @keyword

(comment) @comment 

(tag_name) @tag

(class_name) @type

(id_name) @constant

[
  (property_name)
  (feature_name)
] @property

(function_name) @function

[
  "~"
  ">"
  "+"
  "-"
  "*"
  "/"
  "="
  "^="
  "|="
  "~="
  "$="
  "*="
] @operator

[
  "and"
  "or"
  "not"
  "only"
] @keyword.operator

(important) @keyword.modifier

[
  (nesting_selector)
  (universal_selector)
] @character.special

(attribute_selector
  (plain_value) @string)

(pseudo_element_selector
  "::"
  (tag_name) @attribute)

(pseudo_class_selector
  (class_name) @attribute)

(attribute_name) @tag.attribute

(namespace_name) @module

(keyframes_name) @variable

((property_name) @variable
  (#lua-match? @variable "^[-][-]"))

((plain_value) @variable
  (#lua-match? @variable "^[-][-]"))

[
  (string_value)
  (color_value)
  (unit)
] @string

(integer_value) @number

(float_value) @number.float

[
  "#"
  ","
  "."
  ":"
  "::"
  ";"
] @punctuation.delimiter

[
  "{"
  ")"
  "("
  "}"
  "["
  "]"
] @punctuation.bracket

[
  "@at-root"
  "@debug"
  "@error"
  "@extend"
  "@forward"
  "@mixin"
  "@use"
  "@warn"
] @keyword

"@function" @keyword.function

"@return" @keyword.return

"@include" @keyword.import

[
  "@while"
  "@each"
  "@for"
  "from"
  "through"
  "in"
] @keyword.repeat

(single_line_comment) @comment 

(function_name) @function

[
  ">="
  "<="
] @operator

(mixin_statement
  (name) @function)

(mixin_statement
  (parameters
    (parameter) @variable.parameter))

(function_statement
  (name) @function)

(function_statement
  (parameters
    (parameter) @variable.parameter))

(plain_value) @string

(keyword_query) @function

(identifier) @variable

(variable_name) @variable

(each_statement
  (key) @variable.parameter)

(each_statement
  (value) @variable.parameter)

(each_statement
  (variable_value) @variable.parameter)

(for_statement
  (variable) @variable.parameter)

(for_statement
  (_
    (variable_value) @variable.parameter))

(argument) @variable.parameter

(arguments
  (variable_value) @variable.parameter)

[
  "["
  "]"
] @punctuation.bracket

(include_statement
  (identifier) @function)