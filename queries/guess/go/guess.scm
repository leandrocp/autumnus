; Distinctive Go receiver and concurrency structures.
(method_declaration
  receiver: (parameter_list
    (parameter_declaration
      type: (_)))
  name: (field_identifier)
  parameters: (parameter_list)
  body: (block)) @guess

(select_statement
  (communication_case
    communication: [
      (send_statement)
      (receive_statement)
    ])) @guess

(go_statement
  (call_expression
    arguments: (argument_list))) @guess

(source_file
  (package_clause)
  (import_declaration
    (import_spec))) @guess
