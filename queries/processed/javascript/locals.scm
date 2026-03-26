; This file is auto-generated. Do not edit.
; inherits: ecma
; Scopes
;-------
(statement_block) @local.scope

(function_expression) @local.scope

(arrow_function) @local.scope

(function_declaration) @local.scope

(method_definition) @local.scope

(for_statement) @local.scope

(for_in_statement) @local.scope

(catch_clause) @local.scope

; Definitions
;------------
(variable_declarator
  name: (identifier) @local.definition.var)

(variable_declarator
  name: (object_pattern
    (shorthand_property_identifier_pattern) @local.definition.var))

(variable_declarator
  (object_pattern
    (pair_pattern
      (identifier) @local.definition.var)))

(import_specifier
  (identifier) @local.definition.import)

(namespace_import
  (identifier) @local.definition.import)

(function_declaration
  (identifier) @local.definition.function
  (#set! definition.var.scope parent))

(method_definition
  (property_identifier) @local.definition.function
  (#set! definition.var.scope parent))

; References
;------------
(identifier) @local.reference

(shorthand_property_identifier) @local.reference

; Both properties are matched here.
;
;   class Foo {
;     this.#bar = "baz";
;     this.quuz = "qux";
;   }
(field_definition
  property: [
    (property_identifier)
    (private_property_identifier)
  ] @local.definition.var)

; this.foo = "bar"
(assignment_expression
  left: (member_expression
    object: (this)
    property: (property_identifier) @local.definition.var))

(formal_parameters
  (identifier) @local.definition.parameter)

; function(arg = []) {
(formal_parameters
  (assignment_pattern
    left: (identifier) @local.definition.parameter))

; x => x
(arrow_function
  parameter: (identifier) @local.definition.parameter)

; ({ a }) => null
(formal_parameters
  (object_pattern
    (shorthand_property_identifier_pattern) @local.definition.parameter))

; ({ a: b }) => null
(formal_parameters
  (object_pattern
    (pair_pattern
      value: (identifier) @local.definition.parameter)))

; ([ a ]) => null
(formal_parameters
  (array_pattern
    (identifier) @local.definition.parameter))

(formal_parameters
  (rest_pattern
    (identifier) @local.definition.parameter))

; Both methods are matched here.
;
;   class Foo {
;     #bar(x) { x }
;     baz(y) { y }
;   }
(method_definition
  [
    (property_identifier)
    (private_property_identifier)
  ] @local.definition.function
  (#set! definition.var.scope parent))

; this.foo()
(member_expression
  object: (this)
  property: (property_identifier) @local.reference)