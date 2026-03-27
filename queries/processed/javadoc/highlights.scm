; This file is auto-generated. Do not edit.
[
  (tag_name)
  "include"
  "exclude"
]  @keyword

(identifier)  @variable

(fragment)  @variable.member

(parameter
  name: (identifier) @variable.parameter)

(param_tag
  parameter_name: (identifier) @variable.parameter)

[
  (boolean_type)
  (integral_type)
  (floating_point_type)
]  @type.builtin

(module
  (identifier) @module)

(type
  (identifier) @type)

(type_parameter
  (identifier) @type)

(method
  (identifier) @function)

(member
  (identifier) @variable.member)

[
  (string_literal)
  (indexword)
]  @string

[
  (bare_format_string)
  (literal_format_string)
]  @string.special

(url)  @markup.link.url

(attribute
  name: (identifier)  @property)

(system_property)  @property

(unsigned_integer) @number

(code)  @markup.raw

[
  "="
  ":"
] @operator

[
  "/"
  "."
  ","
  "..."
  "#"
  "##"
] @punctuation.delimiter

[
  "{"
  "}"
  "("
  ")"
  "["
  "]"
] @punctuation.bracket

(param_tag
  [
    "<"
    ">"
  ] @punctuation.bracket)