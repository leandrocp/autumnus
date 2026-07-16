; JSX combined with independent TypeScript type evidence.
((arrow_function
  parameters: (formal_parameters
    (required_parameter
      type: (type_annotation)))
  body: [
    (jsx_element)
    (jsx_self_closing_element)
  ]) @guess
  (#set! guess.supersedes "javascript,typescript"))

((function_declaration
  return_type: (type_annotation)
  body: (statement_block
    (return_statement
      [
        (jsx_element)
        (jsx_self_closing_element)
      ]))) @guess
  (#set! guess.supersedes "javascript,typescript"))
