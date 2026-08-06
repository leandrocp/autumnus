# Query preprocessing drops whole patterns that carry a capture-scoped `#set!`

Found 2026-08-04 while comparing Lumis against Neovim on the same file, with the same parser and the
same queries. Recorded separately from `REVIEW.md` because it is not part of PR #1099: it predates
that branch, is reachable on `main`, and fixing it changes highlighting for six languages.

## Symptom

In `<link type="text/css" rel="stylesheet" href="main.css">`, Neovim underlines `main.css`. Lumis
renders it as an ordinary string.

Asked directly, Neovim reports three captures on that node, and the last one is the one that paints:

```
@string              lang=html   hl=String
@nospell             lang=html   hl=@nospell
@string.special.url  lang=html   hl=Underlined
```

Lumis reports only `string`.

## This is not a missing query, a missing scope, or a missing theme entry

Every ingredient is already in the repository:

- the rule is in the pinned nvim-treesitter source, `queries/upstream/html_tags/highlights.scm:94`
- `string.special.url` is a recognized highlight name in `highlights.toml`
- `themes/dracula.json` maps it to `{"fg": "#8be9fd", "underline": true}`, which is what Neovim's
  `Underlined` resolves to on the same colorscheme

The capture is discarded during query preprocessing, before any of that matters.

## Root cause

`strip_set_capture_patterns` in `crates/dev/src/main.rs:1729` walks top-level s-expressions and
deletes every pattern whose text contains `(#set! @`:

```rust
let pattern = &content[start..j];
if pattern.contains("(#set! @") {
    result.push(&content[last_end..start]);
    last_end = j;
}
```

The upstream pattern it removes is this one, in full:

```scm
((attribute
  (attribute_name) @_attr
  (quoted_attribute_value
    (attribute_value) @string.special.url))
  (#any-of? @_attr "href" "src")
  (#set! @string.special.url url @string.special.url))
```

The function has no comment, but the reason it exists is real. Neovim accepts a three-argument
`#set!` that attaches metadata to a named capture; Tree-sitter does not. Compiled against
`tree-sitter-html` 0.26.1:

```
with (#set! @...)    FAILS: Wrong number of arguments to `#set!` predicate. Expected 1 or 2. Got 3.
directive removed    compiles
```

So the pattern genuinely cannot be handed to Tree-sitter unchanged. The defect is the blast radius of
the response: the directive is the only unsupported part, and it only carries metadata Neovim uses
for `gx` and conceal. The highlight lives in the capture, and the capture is thrown away with it.

## Blast radius

Ten patterns across six query files. Counting only non-`@_` captures, so only things that would have
painted:

| Capture lost | Patterns | Effect |
| --- | --- | --- |
| `markup.link.url` | 3 | Link URLs in `markdown_inline` are not highlighted |
| `string.special.url` | 1 | `href`/`src` values in HTML are not marked as URLs |
| `function` | 1 | `jsx`, `typst` |
| `nospell` | 1 | None; `nospell` is not a recognized highlight name |

Files: `markdown_inline` (3), `typst` (2), `jsx` (2), `latex` (1), `vue` (1), `html_tags` (1).

The Markdown case is probably worth more than the HTML one that surfaced this.

## Proposed fix

Strip the directive, keep the pattern. `strip_set_capture_patterns` becomes a function that removes
`(#set! @…)` forms from within a pattern rather than removing the pattern that contains one.

Care is needed on two points:

- The scan must stay string-aware. It already is, because a query can contain `"("` and `")"` inside
  a literal, and the current byte walk tracks quoting and backslash escapes.
- Removing the directive must not leave a pattern that is only a bare node with no predicates in a
  position where the surrounding wrapper parentheses become redundant. Tree-sitter accepts the
  redundant form, so leaving `((node) @cap (#any-of? ...))` intact is fine.

## How to verify it

- Compile every processed query for all languages, which `mise run test-queries` already does, so a
  pattern that survives stripping but no longer parses fails there.
- Assert the specific captures come back. `@string.special.url` on an `href` value and
  `@markup.link.url` in `markdown_inline` are the two worth pinning, because they are the two a user
  would notice.
- Prove the guard fails first: with the current stripper in place, the new assertions must be red.
- Regenerate conformance fixtures. Any fixture containing a Markdown link or an HTML `href` will
  change, and those diffs are the actual review.
- Re-check against Neovim rather than against expectation, per `AGENTS.md`:
  `vim.inspect_pos(0, row, col)` reports the captures and the resolved highlight group at a position,
  and that is what decided this investigation.

## Scope note

This is independent of dynamic WASM language loading. It touches query generation and changes
rendered output for six languages, so it wants its own change, its own fixture regeneration, and its
own review of those diffs.
