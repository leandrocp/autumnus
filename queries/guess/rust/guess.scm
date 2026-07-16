; Distinctive Rust item and control-flow structures.
(macro_definition
  name: (identifier)
  (macro_rule
    left: (token_tree_pattern)
    right: (token_tree))) @guess

(impl_item
  trait: (_)
  type: (_)
  body: (declaration_list)) @guess

(trait_item
  name: (type_identifier)
  body: (declaration_list)) @guess

(let_declaration
  pattern: (_)
  value: (_)
  alternative: (block)) @guess
