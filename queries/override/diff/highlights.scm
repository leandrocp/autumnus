(comment) @comment

[
  (addition)
  (new_file)
] @diff.plus

[
  (deletion)
  (old_file)
] @diff.minus

(commit) @constant

(location) @attribute

(command
  "diff" @function
  (argument) @variable.parameter)

(filename) @string.special.path

(mode) @number

([
  ".."
  "+"
  "++"
  "+++"
  "++++"
  "-"
  "--"
  "---"
  "----"
] @punctuation.special
  (#set! priority 95))

[
  (binary_change)
  (similarity)
  (file_change)
] @label

(index
  "index" @keyword)

(similarity
  (score) @number
  "%" @number)

; `git diff --word-diff` marks changed runs inside a line rather than marking the
; whole line. `HighlightOptions::word_diff` keeps these scopes; without it they
; are dropped, because `[-` and `{+` are ordinary characters to every other
; producer and a unified diff containing them has not changed there.
;
; Only `context` and `unrecognized` carry them. A word-diff body line has no
; marker column, so a `+` or `-` line in a unified diff can never be one.

(context
  (word_deletion) @diff.minus.word)

(unrecognized
  (word_deletion) @diff.minus.word)

(context
  (word_addition) @diff.plus.word)

(unrecognized
  (word_addition) @diff.plus.word)
