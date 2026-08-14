; Word diff, as produced by `git diff --word-diff` (mode `plain`).
;
; The captures are scoped to their parent line so that a *unified* diff whose
; source text happens to contain `{+x+}` on a `+`/`-` line keeps the line colour
; it already had. Git documents the format as ambiguous, since it escapes
; nothing; restricting to `context` and `unrecognized` removes the cases that
; would otherwise contradict a marker Lumis is already sure about.
;
; The delimiters are inside the captured range because that is what git itself
; does: `--word-diff=plain` with colour enabled emits `ESC[31m[-Jason-]ESC[m`.

(context
  (word_deletion) @diff.minus)

(unrecognized
  (word_deletion) @diff.minus)

(context
  (word_addition) @diff.plus)

(unrecognized
  (word_addition) @diff.plus)
