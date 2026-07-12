; Java package plus top-level type, or a class constructor.
(program
  (package_declaration)
  [
    (class_declaration)
    (interface_declaration)
    (enum_declaration)
    (record_declaration)
  ]) @guess

(class_declaration
  body: (class_body
    (constructor_declaration
      parameters: (formal_parameters)
      body: (constructor_body)))) @guess
