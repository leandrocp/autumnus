; tree-sitter-python 0e87bd7 marks `expression_statement` as a supertype, so it
; no longer appears in the tree and class-body assignments sit directly under
; `block`. The upstream `(expression_statement (assignment ...))` patterns still
; compile but match nothing, which silently downgrades class attributes from
; `@local.definition.field` to the generic `@local.definition.var` rule.
; Re-state them against the current tree shape.
(class_definition
  body: (block
    (assignment
      left: (identifier) @local.definition.field))) @local.scope

(class_definition
  body: (block
    (assignment
      left: (_
        (identifier) @local.definition.field)))) @local.scope
