; Shared fallback bracket query.
;
; Keep this file small and grammar-agnostic. Language-specific queries can add
; delimiters that need grammar context, such as generic angle brackets or custom
; paired tokens.

("(" @open
  ")" @close)

("[" @open
  "]" @close)

("{" @open
  "}" @close)
