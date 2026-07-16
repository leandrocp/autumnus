; This file is auto-generated. Do not edit.
; inherits: markdown
(fenced_code_block
  (info_string
    (language) @injection.language)
  (code_fence_content) @injection.content)

((html_block) @injection.content
  (#set! injection.language "html")
  (#set! injection.combined)
  (#set! injection.include-children))

((minus_metadata) @injection.content
  (#set! injection.language "yaml")
  (#offset! @injection.content 1 0 -1 0)
  (#set! injection.include-children))

((plus_metadata) @injection.content
  (#set! injection.language "toml")
  (#offset! @injection.content 1 0 -1 0)
  (#set! injection.include-children))

([
  (inline)
  (pipe_table_cell)
] @injection.content
  (#set! injection.language "markdown_inline"))

; ESM import/export blocks at the top level of the document
((inline) @injection.content
  (#match? @injection.content "^(import|export)\\s")
  (#set! injection.language "javascript"))

; MDX expression blocks on their own line, e.g. {/* a comment */} or
; {props.title} — a braced expression is valid JavaScript, so an MDX
; comment highlights as a JavaScript comment
((inline) @injection.content
  (#match? @injection.content "^[{]")
  (#set! injection.language "javascript"))