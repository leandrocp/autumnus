[
  "module" "func" "param" "result" "type" "memory" "elem" "data" "table" "global"
  "if" "then" "else" "block" "loop" "end" "mut"
] @keyword

["import" "export"] @keyword.import

["local"] @keyword.type

[(name) (string)] @string

(identifier) @function

[(comment_block) (comment_line)] @comment

[(nat) (float) (align_offset_value)] @number

(value_type) @type

["(" ")"] @punctuation.bracket
