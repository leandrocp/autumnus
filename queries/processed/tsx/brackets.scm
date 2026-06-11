; This file is auto-generated. Do not edit.
("(" @open
  ")" @close)

("[" @open
  "]" @close)

("{" @open
  "}" @close)

(("<" @open
  ">" @close)
  (#set! rainbow.exclude))

(("<" @open
  "/>" @close)
  (#set! rainbow.exclude))

(("</" @open
  ">" @close)
  (#set! rainbow.exclude))

(("\"" @open
  "\"" @close)
  (#set! rainbow.exclude))

(("'" @open
  "'" @close)
  (#set! rainbow.exclude))

(("`" @open
  "`" @close)
  (#set! rainbow.exclude))

((jsx_element
  (jsx_opening_element) @open
  (jsx_closing_element) @close)
  (#set! newline.only)
  (#set! rainbow.exclude))