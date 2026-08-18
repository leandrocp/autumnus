# Word diff proof of concept

Investigation for [#1088](https://github.com/leandrocp/lumis/issues/1088). Nothing here is meant to
ship as written. It answers one question: can `git diff --word-diff` be highlighted by adding nodes
to the grammar, instead of by scanning text in the formatter?

It can. `run.sh` builds the patched parser, stages it beside the published one, and renders the same
fixture through both.

## What the patch does

`grammar.patch` applies to `tree-sitter-diff` at `0400db1417a28145bec93001f1ee1411155a7363`. It
splits hunk line content into a repeat of segments and adds two nodes:

```js
const WORD_DELETION = /\[-(?:[^-\r\n]|-+[^-\]\r\n])*-+\]/;
const WORD_ADDITION = /\{\+(?:[^+\r\n]|\++[^+}\r\n])*\++\}/;
```

Both are single tokens. That is the load-bearing detail. `arr[-1]` in an ordinary diff cannot match
`WORD_DELETION`, so the lexer falls back to plain text rather than opening a construct it can never
close. Splitting the delimiters into their own tokens, which is what styling them separately would
need, gives that case an ERROR node instead and would call for an external scanner.

Text segments stay hidden, so a diff with no word markers parses to the tree it parsed to before.

`highlights.append.scm` holds the query side, four patterns, capturing to `diff.minus` and
`diff.plus`. Those scopes already exist and every one of the 246 themes defines them.

## What it does not do

`queries/override/diff/highlights.scm` is deliberately untouched. `crates/lumis` compiles that file
against `tree-sitter-diff` from crates.io, which has published exactly one version, `0.1.0` from
October 2024, and has none of these nodes:

```
Query error at 54:2. Invalid node type "word_deletion"
```

Landing this for real means vendoring the parser the way 47 others already are, so one pinned
revision feeds both the WASM packages and the native crate. Until then the query lives here.

## Running it

```sh
poc/word-diff/run.sh
```

Needs `tree-sitter`, `cargo` and `python3`, network for one shallow clone, and writes everything
under `poc/word-diff/.work/`. The script fails if the patched parser changes the rendering of the
4138-line unified diff in `fixtures/`.

## Fixtures

| File | What it is |
| --- | --- |
| `word-diff-plain.diff` | `git diff --word-diff=plain`, the format #1088 asks for |
| `word-diff-porcelain.diff` | `git diff --word-diff=porcelain`, which already renders correctly apart from the `~` lines |
| `unified-brackets.diff` | ordinary diff carrying `arr[-1]`, trailing `[`/`{`, and a literal `{+y+}` in source |
| `unified-regression.diff` | `git log -p -8` from this repo, used as the no-change check |

## Measurements

Taken on the fixtures above, patched parser against the same grammar unpatched.

| | Result |
| --- | --- |
| Output change on `unified-regression.diff` | none, byte for byte |
| Parse time | 3.7-3.8 ms patched, 4.0-4.8 ms unpatched |
| Parser size | 49,190 to 52,843 bytes |
| ERROR nodes on `unified-brackets.diff` | 0 |
| New highlight scopes, theme entries, CSS classes | 0 |
