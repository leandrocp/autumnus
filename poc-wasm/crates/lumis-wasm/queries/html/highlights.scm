(tag_name) @tag

(comment) @comment

(attribute_name) @tag.attribute

(quoted_attribute_value) @string

(attribute_value) @string

(text) @none

[
  "<"
  ">"
  "</"
  "/>"
] @tag.delimiter

"=" @operator

(doctype) @constant

"<!" @tag.delimiter

(entity) @character.special
