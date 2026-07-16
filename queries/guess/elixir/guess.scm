; High-confidence Elixir forms used only for last-resort language guessing.
; Keep these patterns structural: ordinary prose parses surprisingly well as Elixir.

; Module-like definitions with a block.
(call
  target: (identifier) @definition
  (do_block)
  (#any-of? @definition "defmodule" "defprotocol" "defimpl")) @elixir

; Function and macro definitions with a block.
(call
  target: (identifier) @definition
  (do_block)
  (#any-of? @definition "def" "defp" "defmacro" "defmacrop" "defguard" "defguardp")) @elixir

; One-line function and macro definitions using `do:`.
(call
  target: (identifier) @definition
  (arguments
    (_)
    (keywords
      (pair
        key: (keyword) @do_keyword)))
  (#any-of? @definition "def" "defp" "defmacro" "defmacrop" "defguard" "defguardp")
  (#eq-trimmed? @do_keyword "do:")) @elixir
