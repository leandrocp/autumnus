; inherits: markdown

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
