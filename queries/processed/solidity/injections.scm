; This file is auto-generated. Do not edit.
((comment) @injection.content
  (#set! injection.language "comment"))

((comment) @injection.content
  (#match? @injection.content "^///[^/]")
  (#set! injection.language "doxygen"))

((comment) @injection.content
  (#match? @injection.content "^///$")
  (#set! injection.language "doxygen"))

((comment) @injection.content
  (#match? @injection.content "^/[*][*][^*][\\s\\S]*[*]/$")
  (#set! injection.language "doxygen"))