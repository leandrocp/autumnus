; Decorated definitions and structural pattern matching.
(decorated_definition
  (decorator)
  definition: [
    (function_definition)
    (class_definition)
  ]) @guess

(match_statement
  body: (block
    (case_clause))) @guess
