; tree-sitter-python 0e87bd7 marks `expression_statement` as a supertype, so it
; no longer appears in the tree and class-body assignments sit directly under
; `block`. The upstream `(expression_statement (assignment ...))` patterns still
; compile but match nothing, which silently downgrades class attributes from
; `@local.definition.field` to the generic `@local.definition.var` rule.
; Put the new shape in an alternation whose first branch is valid for the older
; WebAssembly grammar. The compatibility branch intentionally has no captures:
; the upstream patterns above still classify fields in that grammar, while the
; newer native grammar matches the direct `assignment` branch below.
(class_definition
  body: (block
    [
      (expression_statement)
      (assignment
        left: (identifier) @local.definition.field)
    ]))

(class_definition
  body: (block
    [
      (expression_statement)
      (assignment
        left: (_
          (identifier) @local.definition.field))
    ]))
