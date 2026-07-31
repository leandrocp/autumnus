# Review: PR #1099 — `feat: unify dynamic WASM language loading`

Scope reviewed: `main...lp-unified-wasm-languages`, starting at `fdd756949` (after merging
`origin/main` at `6cc5386a2`).

Fixes from the second pass are committed on this branch:

| Commit | Closes |
| --- | --- |
| `fix: make every runtime accept the same language package` | §4.7, §4.8, §4.9 |
| `fix: apply the #offset! directive in every runtime` | §3 |

**Verdict: do not merge as-is.** The architecture is right — one package format carrying parser +
queries + integrity + provenance, released atomically, is a genuine improvement, and moving
Lua→regex translation to generation time so every runtime consumes byte-identical `.scm` is the
correct call. CI is fully green, and the loading pipeline is now one Rust implementation that the
CLI and Elixir share, leaving JavaScript as the single port the browser forces (§8).

This document is a living guideline. Items are fixed in place and marked **DONE** only once a
reproducible test pins the behavior.

## Against the stated objectives

| Objective | State |
| --- | --- |
| Reuse the Rust core | **Largely met.** resolve→verify→cache is one Rust implementation; the CLI and Elixir both use it. JavaScript remains a port, which is the forced one. §8 |
| Safety | Mostly good. No new `unsafe`. Integrity checking is real, but its trust anchor is weaker than the docs imply. §4.1 |
| All runtimes produce the same output | **Met, as far as conformance can show.** §3, §4.7 and §4.8 fixed; all five runtimes pass `mise run test-conformance`. |
| Performance | Known regressions, some avoidable. §4.3a is a concrete N+1. |
| No silly mistakes | A handful. §6, §7 |
| Reduce code | Net +8.8k. Some unavoidable; the triplicated pipeline is not. §8. `formatVersion` gate deleted, 4 copies → 2. §4.9 |

## Status

| Item | State |
| --- | --- |
| 0 Branch fails its own JS test suite after merging `main` | **DONE** — CI fully green at `b228ef8e5` (105 pass, 0 fail) |
| 1.1 Clojure throws on load in JS | **DONE** (re-verified) |
| 1.2 Negated character classes inverted | **DONE** (re-verified) |
| 1.3 Nested classes diverge between Rust and JS | **DONE** (re-verified) |
| 1.4 `.` and mid-pattern `$` mistranslated (found while fixing 1.1) | **DONE** (re-verified) |
| 1.6 Query-string escapes not resolved before translation | **DONE** (re-verified) |
| 1.7 Two dead query patterns in `vim` and `sql` | **DONE** (re-verified) |
| 2 Query compilation silently skips 67% of languages | **DONE**, but the waiver is now stale — see §0 |
| 3 `#offset!` removed, regression blessed into fixtures | **DONE** |
| 4.1 `@latest` at runtime | **Won't fix, by design** — pinning would undo release-free parser updates; the guard is pre-publish CI |
| 4.4, 4.6 Production risks | open |
| 4.2 Elixir capped at 4 threads | **DONE** — private pool removed; the BEAM's dirty CPU schedulers decide |
| 4.3 `:global.trans` cluster-wide lock | **DONE** — node-local `Lumis.Loader`, one key at a time |
| 4.5 `crypto.subtle` on non-secure origins | **DONE** — pure-JS SHA-256 fallback, pinned against `crypto.subtle` |
| 4.7 Same `language.json` accepted by Rust, rejected by JS | **DONE** |
| 4.8 Package resolution precedence differs per runtime | **DONE** |
| 4.9 `formatVersion` runtime gate removed | **DONE** |
| 5, 6, 7 Medium / low / nits | open |
| 8 Three copies of the loading pipeline | **largely DONE** — one Rust implementation, Elixir delegates, JS is the remaining port |

## Evidence base

What was actually run for the second pass, so the claims can be weighed:

| Check | Result |
| --- | --- |
| `cargo check --workspace --locked --all-targets` | pass |
| `cargo check --manifest-path crates/dev/Cargo.toml --locked --all-targets` | pass |
| `cargo test -p lumis-build --locked` | 36 unit + 7 corpus + 3 doctests pass |
| `cargo test -p lumis-wasm-runtime --locked` | 14 pass |
| `cargo test --manifest-path crates/dev/Cargo.toml --locked` | 12 pass |
| `cargo test -p lumis --test strict_aliasing_headers` | 1 pass |
| `cargo run -p dev -- gen-language-catalog --check` | catalog current |
| `pnpm install --frozen-lockfile` | lockfile in sync |
| JS package suite (`vitest run`, the package's own excludes) | **1 failed** (§0), 359 passed, 1 skipped |
| `cargo test --workspace --locked` | all pass — first complete run, after the disk was freed |
| `mix test` (Elixir, `LUMIS_BUILD=1`) | 123 passed, 115 conformance excluded |
| `npx tsc --noEmit` | clean |
| `cargo fmt --check` / `cargo clippy --all-targets` on both changed crates | clean |
| §4.7 divergence, Rust vs JS validator on one crafted `language.json` | reproduced, then fixed and pinned |
| §4.7 / §4.8 guards, four injected faults | every guard observed failing, then reverted |
| §1 DONE items, against checked-in `queries/processed/` | all verified |
| `mise run test-conformance` (Rust, CLI, JS WASM, browser, Elixir) | **all five pass** after the §3 fix: Rust 138, CLI 115, JS 115, browser 24, Elixir 115 |

`mise run test-conformance` is the guard that substantiates "all runtimes produce the same output"
end to end. It now runs green across all five runtimes with the §4.7/§4.8/§4.9 changes applied,
including the removal of a field from the shared package format. That is the strongest evidence in
this document, and it was the gap flagged in the previous pass.

Note the PR body claims "JavaScript: 514 Lumis tests passed". The package's own `test` script runs
361. Reconcile the number before merge.

---

## 0. The branch does not pass its own tests

After merging `origin/main`:

```
$ pnpm install --frozen-lockfile
$ npx vitest run --exclude test/conformance.test.ts --exclude 'test/browser/**'

FAIL test/query-compile.test.ts > unverified parser waiver
  > lists every language whose published package cannot verify it
AssertionError: add these to test/unverified-parsers.json, or publish the parser packages
+ [ "bash: installed package is at rev a06c2e44, languages.toml pins 382ed871",
+   "html: ...", "ruby: ...", "svelte: ...", "yaml: ..." ]

Test Files  1 failed | 15 passed (16)
      Tests  1 failed | 359 passed | 1 skipped (361)
```

(Counts are after this review's §4.7 corpus tests were added; the failure itself is unchanged.)

Cause: `main`'s #1117 (`fix: vendor strict-aliasing-unsafe parsers`) repointed bash, html, python,
ruby, svelte, and xml at forked repositories with new revisions. `languages.toml` now pins revisions
ahead of the published `@lumis-sh/wasm-*` packages, so five languages dropped out of query coverage
without being declared.

**This is the §2 guard working exactly as designed** — "a parser bump silently drops a language out
of coverage" is the case it was built for, and it failed loudly instead of quietly checking less.

Remedy: regenerate with `node packages/javascript/lumis/scripts/list-unverified-parsers.mjs`. That
moves the waiver from 77 to 82 of 115 languages — **71% of the catalog** — which deserves a
conscious decision rather than a mechanical regeneration. It also invalidates the coverage figures
quoted in §2 below (`41/115 verified, 74 without a usable parser`); re-measure after regenerating.

---

## 1. Blocking defects

All four items below had the same root cause: `convert_lua_matches` translated Lua patterns
character by character without modelling Lua's grammar, so positional meaning and character-class
context were lost.

The fix replaces it with a real Lua-pattern parser in the shared Rust core,
`crates/lumis-build/src/lib.rs`, which emits a regex that is valid **and equivalent** in both the
`regex` crate and JavaScript `RegExp`. Reference semantics were taken from Neovim itself
(`runtime/lua/vim/treesitter/query.lua`), since the queries come from `nvim-treesitter`:
`#lua-match?` is `string.find`, i.e. a Lua 5.1 pattern, while `#match?` is evaluated by
Tree-sitter's own engine in each runtime. `AGENTS.md` now records this as a standing rule.

The translation was validated against Neovim itself rather than against a reading of the Lua manual:

```
$ nvim --headless -c 'lua ... string.find(subject, pattern) ...'
^-%>[^>].*           "->foo"=true   "-->foo"=false
^/[*][*][^*].*[*]/$  "/** hi */"=true  "/*** hi */"=false  "/**\nx\n*/"=true
^[%u]                "Foo"=true     "foo"=false
^$env:               "$env:PATH"=true  "env:PATH"=false
```

Every one of those matches the regex this branch now generates, including the multi-line case that
motivated 1.4.

Verification (all non-skipping):

- `crates/lumis-build/src/lib.rs` — 36 unit tests, 3 doctests (re-measured; was 34 when first written)
- `crates/lumis-build/tests/processed_queries.rs` — 7 corpus tests over all 120 query directories
  and 244 predicates: every regex compiles under the `regex` crate, none nests a character class,
  none uses an inline flag group, no `#lua-match?` survives, every upstream Lua pattern is
  translatable, and each defect below is pinned by input/output assertions
- `packages/javascript/lumis/test/query-patterns.test.ts` — 9 tests applying the same corpus
  checks with `RegExp`, parser-free so no language can be skipped

```
cargo test -p lumis-build                                    # 34 + 7 + 3 pass
pnpm --filter @lumis-sh/lumis test -- test/query-patterns     # 9 pass
cargo test --workspace                                       # 466 pass
mise run test-conformance-rust                                # 138 pass, unchanged
LUMIS_TEST_RUNTIME=wasm pnpm --filter @lumis-sh/lumis test:conformance  # 115 pass, unchanged
```

End-to-end, compiling every processed query against every locally installed parser went from
**38 languages checked / 1 hard failure** to **276 queries compiled across all 115 languages / 0
regex failures**.

Three queries still failed against the *installed* packages with `Bad node name` — `fortran`
(`and`), `jinja` and `jinja_inline` (`endtrans_statement`). Those turned out not to be defects at
all: building `tree-sitter-fortran` at the revision `languages.toml` pins and recompiling gives
`OK`. The failures were an artifact of checking current queries against a stale published grammar,
which is exactly the trap described in §2 and is why parser resolution now prefers a correctly
pinned parser.

### 1.1 Clojure throws on load in the JavaScript/browser runtime — DONE

`crates/lumis-build/src/lib.rs:179` now rewrites every `-` outside a character class into the
lazy quantifier `*?`. In Lua patterns `-` is only a quantifier when it *follows* a pattern item;
a leading or literal `-` is just a dash. The nvim Clojure query has one:

```
main:  (#lua-match? @constructor "^-%>[^>].*")
now:   (#match?     @constructor "^*?\\>[\\^>].*")
```

`^*?` is not a legal JavaScript regex. `web-tree-sitter` compiles `#match?` eagerly at
`new Query(...)` (`web-tree-sitter.js:3454`), so the whole Clojure query fails to compile,
`compileHighlightConfig` throws, and `createLoadedLanguage` rejects. Any
`codeToHtml(src, { lang: "clojure" })` throws.

Reproduced against the real parser:

```
$ node --input-type=module -e '...Language.load(clojure.wasm); new Query(g, processed/clojure/highlights.scm)'
QUERY FAILED: Invalid regular expression: /^*?\>[\^>].*/: Nothing to repeat
```

Rust's `regex` crate happens to accept `^*?`, so Rust/CLI/Elixir do not crash — they just
silently stop matching `->`. This is a cross-runtime divergence *and* a JS crash.

**Fixed.** The converter now tracks whether the previous token was a single pattern item, which is
the only position where Lua reads `*`, `+`, `-`, or `?` as a quantifier. Everywhere else they are
literal characters, exactly as `string.find` reads them.

```
main:  (#lua-match? @constructor "^-%>[^>].*")
fixed: (#match?     @constructor "^->[^>][\\s\\S]*")
```

Pinned by `leading_dash_is_a_literal_not_a_quantifier`,
`quantifier_after_a_quantifier_is_a_literal`, `leading_quantifier_characters_are_literals`, and
`compiles the Clojure threading-macro predicate` in the JavaScript corpus test. Verified against
the real parser: `new Query(clojureGrammar, processed/clojure/highlights.scm)` now succeeds.

### 1.2 Negated character classes are inverted in 20 languages — DONE

`crates/lumis-build/src/lib.rs:182` escapes `^` whenever the output buffer is non-empty. It does
not special-case `^` immediately after `[`, which is class negation in both Lua and regex:

```
main:  (#lua-match? @comment.documentation "^/[*][*][^*].*[*]/$")
now:   (#match?     @comment.documentation "^/[*][*][\\^*].*[*]/$")
```

`[^*]` ("not a star") became `[\^*]` ("a caret or a star"). Verified with the actual `regex`
crate:

```
doc matches '/** hi */'  = false     <- should be true
doc matches '/**^ hi */' = true      <- should be false
```

So `@comment.documentation` stops matching normal doc comments and starts matching malformed
ones. 32 query files across: **arduino, c, c_sharp, clojure, cpp, d, ecma, elm, glsl, java,
javascript, kotlin, objc, pascal, proto, qmljs, scala, solidity, swift, tsx, typescript**.
Doxygen/JSDoc `@injection.content` predicates (`/[*/][!*/]<?[\^a-zA-Z]`) are hit too, so those
injections silently stop firing.

Note this was *already* broken in Rust on `main` (differently — the old converter escaped every
metachar, so nothing matched). It was **correct in JS on main**, because the old
`convertLuaMatchesForBrowser` in `build-langs.ts` passed `[^*]` through untouched. Unifying on the
Rust converter regressed JS to the Rust bug.

**Fixed.** `[...]` is now parsed as a unit by `convert_lua_set`, which recognises a leading `^` as
negation, treats a `]` in the first member position as a literal (matching Lua's `classend`), and
keeps range separators intact.

```
main:  (#lua-match? @comment.documentation "^/[*][*][^*].*[*]/$")
fixed: (#match?     @comment.documentation "^/[*][*][^*][\\s\\S]*[*]/$")
```

Both directions are pinned, since the broken pattern matched exactly the complement of the correct
one: `/** hi */` matches again and `/*** hi */` no longer does
(`documentation_comment_predicate_keeps_its_negation`, `caret_after_open_bracket_negates_the_set`,
`caret_inside_a_set_but_not_first_is_a_member`,
`closing_bracket_as_the_first_member_is_a_literal`).

### 1.3 Nested classes from `%u`/`%l` work in Rust, silently fail in JS — DONE

`%u` maps to `[A-Z]` unconditionally, including inside a class, so Lua `^[%u]` becomes `^[[A-Z]]`.
Rust's `regex` supports nested classes and reads that as `[A-Z]`. JavaScript `RegExp` (no `v`
flag) reads it as "`[` or A-Z, then a literal `]`":

```
"^[[A-Z]]"        on "Foo"    -> Rust: true   JS: false
"^[[A-Z][a-z]]"   on "Foo"    -> Rust: true   JS: false
"^_?[[A-Z]].*[[a-z]]" on "IClass" -> Rust: true  JS: false
```

Affects `@type`/`@tag`/`@constant`/`@function.call` in **arduino, clojure, cmake, cpp, dart,
glimmer**. Pre-existing for JS, but this PR is what makes Rust and JS disagree (Rust's behaviour
changed here), and conformance has no fixture covering it.

**Fixed.** Lua classes now have two expansions: a standalone form (`%u` → `[A-Z]`) and a bare
class-body fragment used inside a set (`%u` → `A-Z`), so nothing nests. A literal `[` inside a
class is escaped for the same reason, since the `regex` crate would otherwise read it as nesting.

```
main:  (#lua-match? @type "^[%u]")   ->  (#match? @type "^[[A-Z]]")
fixed: (#lua-match? @type "^[%u]")   ->  (#match? @type "^[A-Z]")
```

Beyond the unit tests (`classes_inside_a_set_expand_to_bare_ranges`,
`literal_bracket_inside_a_set_is_escaped`), the corpus tests
`no_predicate_regex_nests_a_character_class` and `never nests a character class` assert that **no**
predicate in the repository can ever regress into a nested class again.

While fixing this, the same divergence class was found in the shorthand escapes: `\d`, `\w`, and
`\s` are Unicode-aware in the `regex` crate and ASCII-only in `RegExp`. Lua classes now expand to
explicit ASCII ranges (`%d` → `[0-9]`, `%s` → `[\t-\r ]`), which matches Lua's C-locale definitions
and is byte-identical in both engines.

### 1.4 Lua `.` and mid-pattern `$` were mistranslated — DONE

Found while fixing 1.1, same root cause, and 1.2 is not genuinely fixed without it.

**`.` does not cross newlines in regex.** Lua's `.` matches any character including `\n`; regex `.`
stops at a newline unless the engine is in dot-matches-all mode, which is not portable. Every
multi-line doc comment would therefore still have failed `^/[*][*][^*].*[*]/$` even with the
negation repaired. `.` now emits `[\s\S]`, which is exact in both engines.

**`$` anchors only at the end of a Lua pattern.** Elsewhere it is a literal. A bare `$` was passed
through as an anchor:

```
main:  (#lua-match? @variable.builtin "^$env:")  ->  (#match? ... "^$env:")   never matches
fixed: (#lua-match? @variable.builtin "^$env:")  ->  (#match? ... "^\\$env:")
```

Pinned by `dot_matches_any_character_including_newlines`, `dollar_anchors_only_at_the_end`,
`caret_anchors_only_at_the_start`, and the multi-line and `$env:` assertions in both corpus tests.

### 1.6 Query-string escapes were not resolved before translation — DONE

Caught by reviewing the regenerated diff rather than by a test, which is why the semantic
side-by-side below is now part of the workflow.

Tree-sitter resolves a query string's escapes before a predicate ever sees the argument, so
`"^#![ \t]*/"` reaches Neovim's `string.find` as a pattern containing a real tab. The converter was
reading the *source* text, so it saw a backslash followed by `t` and emitted a literal backslash:

```
upstream:  (#lua-match? @keyword.directive "^#![ \t]*/")     tab
regressed: (#match?     @keyword.directive "^#![ \\\\t]*/")  backslash or t
fixed:     (#match?     @keyword.directive "^#![ \\t]*/")    tab
```

`convert_line` now unescapes the argument first, and control characters are emitted as `\t`, `\n`,
`\r`, `\0` so the generated `.scm` never carries a raw tab inside a string literal. Pinned by
`query_string_escapes_are_resolved_before_translation` and
`a_literal_backslash_in_a_lua_pattern_stays_literal`.

### 1.7 Two query patterns were dead in Neovim too — DONE

Verified by running the patterns through Neovim's own `string.find`, which is now the documented
way to settle these questions:

```
^[%d]+(%.[%d]+)?$   "42"=false  "1.5"=false  "42?"=false
^[-]?%d*\.%d*$      "1.5"=false
```

- `queries/upstream/vim/highlights.scm` matches option values with `^[%d]+(%.[%d]+)?$`. Lua cannot
  quantify a capture, so the `?` after `)` is a literal and the predicate matches nothing — in
  Neovim either. The converter is faithful here, so the fix belongs in the query: a working
  equivalent is now appended in `queries/append/vim/highlights.scm` rather than overriding the whole
  upstream file. `@number` works in vim option values again.
- `queries/override/sql/highlights.scm` is Lumis-authored and used `\.` where `%.` was meant. In a
  Lua pattern `\` is an ordinary character, so it required a literal backslash. Corrected to `%.`.

This is the division of responsibility worth keeping: the converter stays faithful to Neovim, and
authoring mistakes are fixed visibly in `queries/override/` or `queries/append/`.

### 1.5 Related hardening delivered with the above

- **Untranslatable patterns now fail generation.** `try_convert_lua_matches` returns
  `LuaPatternError` for `%b`, `%f`, back references, and complement classes inside a set;
  `crates/dev` uses it, so a future `nvim-treesitter` query that Lumis cannot translate faithfully
  aborts preprocessing instead of shipping a regex that means something else. The corpus test
  `every_upstream_lua_pattern_is_translatable` covers the current upstream tree.
- **Only the pattern argument is rewritten.** The old code converted the first quoted string on any
  line containing a Lua predicate, so `(#lua-match? @x "%d") (#eq? @y "a-b")` would have corrupted
  the `#eq?` argument. Conversion is now scoped per operator and handles multiple predicates per
  line (`only_the_pattern_argument_is_rewritten`,
  `multiple_lua_predicates_on_one_line_are_all_converted`).

---

## 2. The reason CI didn't catch any of this

`packages/javascript/lumis/test/query-compile.test.ts` is the only test that compiles queries
against real grammars. It has three silent `return` guards. Measured against the current
workspace:

```
checked: 38   skipped: 77
skip reasons: {"rev-mismatch": 77}
clojure: rev-mismatch
```

**67% of languages are silently skipped** and the test still reports green. The skip rate grows
every time `languages.toml` advances a rev ahead of the published npm package — i.e. it decays
toward checking nothing.

Compounding it, `test/all-languages.test.ts` used to assert
`typeof language.highlights === "string"`; this PR replaces that with
`typeof language.packageName === "string"`. Queries no longer ship in the runtime package, so the
last per-language content assertion is gone.

**Required before merge:** make query compilation non-skippable. Compile every
`queries/processed/<lang>/*.scm` against the grammar and *fail* (not skip) when the parser is
missing or at the wrong rev. If revs legitimately lag, at minimum assert every `#match?` pattern
compiles under both `RegExp` and `regex::bytes::Regex` — that is a fast, parser-free test that
would have caught all three defects above.

**DONE.**

### Root cause

The hypothesis that this was caused by unpublished WASM packages is correct, and it is worse than
rev lag alone. Measured against the current workspace:

```
all 115 parser packages installed
 38 at the revision languages.toml pins
 77 built from an older revision
  0 carrying language.json
```

No `@lumis-sh/wasm-*` package has been republished in the new format yet, and 77 predate the
current `languages.toml` revisions. So the test could not compile those queries against a matching
grammar — but its response was to `return` from the test body, which reports **pass**. That is the
part that is not acceptable: an unverifiable language and a verified language produced the same
green result, and the count was invisible.

### Fix

Coverage is now enforced at two levels, neither of which can silently skip.

**Level 1 — parser-free, 100% coverage, no waivers.** Regex validity and cross-engine portability
do not need a grammar, so they are checked for every language in both runtimes:

- `crates/lumis-build/tests/processed_queries.rs` compiles all 244 predicates with
  `regex::bytes::Regex`
- `packages/javascript/lumis/test/query-patterns.test.ts` compiles the same 244 with `RegExp`
- both additionally reject nested character classes, inline flag groups, and any surviving
  `#lua-match?`, and assert the corpus size so a shrinking corpus fails

**Level 2 — grammar-aware, publication-independent.** `query-compile.test.ts` was rewritten:

- languages are enumerated from `languages.toml`, not from the installed bundle, so a language
  cannot disappear from the run
- parsers resolve from the installed package first, so the check exercises the artifact that ships,
  and fall back to `$LUMIS_WASM_PATH/parsers/` then `tmp/wasms/` when the package is missing
  or lagging. A locally built parser needs no revision check because it was built from the pinned
  revision
- a compile error fails the run with the language and query kind named
- the waiver is judged **only** against npm state, so it stays meaningful whether or not parsers
  were built locally. An undeclared gap fails; an entry whose package is published at the pinned
  revision fails as stale. The list can only shrink
- coverage is logged every run: `41/115 languages verified, 74 without a usable parser`
- `LUMIS_QUERY_LANGUAGES` shards the run; `LUMIS_QUERY_COVERAGE=complete` requires every selected
  language to be verified, so a parser build failure cannot be mistaken for a lagging package

`mise run test-queries` closes the gap: it runs level 1, builds only the parsers whose packages
cannot verify themselves (`scripts/list-unverified-parsers.mjs`), then requires complete coverage.

### CI

`.github/workflows/queries.yml` runs on any change to `queries/**`, `languages.toml`,
`crates/lumis-build/**`, `crates/dev/**`, or the query tests:

| Job | Cost | What it guarantees |
| --- | --- | --- |
| `portability` | seconds | `queries/processed` is regenerated and unchanged; all 244 predicates compile under both the `regex` crate and `RegExp`; the waiver is consistent |
| `compile-published` | seconds | every language whose package matches its pinned revision compiles against that package |
| `compile` (8 shards) | ~2-3 min per shard | builds the lagging parsers for its shard and compiles their queries with `LUMIS_QUERY_COVERAGE=complete` |

Measured locally over 58 parsers, a build averages ~15 s including the shallow clone, so the 77
lagging parsers are ~20 min sequentially. Sharded 8 ways that is 9-10 parsers per shard, well inside
the 30 min timeout, and it shrinks toward zero as the catalog is republished. The `portability` job
is the one that catches a bad Lua-pattern translation, and it needs no toolchain at all.

### What was and was not verified locally

Being precise, because the toolchain matters here:

- level 1 — fully verified, 100% of languages, both runtimes, with failure injection
- level 2 against **published** packages — verified: 41 languages compile against the real artifact
- level 2 against **locally built** parsers — verified only for grammars without an external
  scanner. Of 58 parsers built locally, 38 load and 20 fail with
  `bad export type for tree_sitter_<lang>_external_scanner_create`, because the local Emscripten is
  6.0.5. This is exactly the incompatibility `AGENTS.md` documents, so it is a local toolchain
  limitation rather than a defect in the test. CI pins `EMSDK_VERSION: 5.0.3`, the same version
  `wasm-release.yml` uses to produce the packages that do load. The sharded `compile` job is
  therefore wired and correct by construction but has not been observed green end to end.

### New finding: `queries/upstream` has drifted ahead of `languages.toml`

Surfaced by the new check, and only visible once queries are compiled against a correctly pinned
grammar:

```
gleam/highlights.scm -> Bad node name 'echo'
```

The vendored queries reference a grammar node that the pinned `tree-sitter-gleam` revision does not
have, so `queries/upstream` was fetched from a newer nvim-treesitter than the parser revision
`languages.toml` pins. That predicate silently does nothing today and the whole Gleam highlights
query fails to compile in JavaScript.

`mise run langs-fetch-queries` and `mise run langs-upgrade-parsers` are independent, so nothing
keeps the two in step. Worth a follow-up: pin the nvim-treesitter revision that queries are fetched
from alongside each parser revision, so this pair cannot drift silently. The sharded `compile` job
will now catch it whenever it happens.

### Verified by failure injection

Each guard was proven to fail, not just to pass:

| Injected fault | Result |
| --- | --- |
| `(#match? @variable "^*?bad")` added to `cpp/highlights.scm` | `query-patterns` and `query-compile` both fail |
| `(#match? @variable "^[[A-Z]]")` added to `cpp/highlights.scm` | Rust `no_predicate_regex_nests_a_character_class` fails |
| `clojure` removed from the waiver | `lists every language without a usable parser` fails |

Note the first row: the exact §1.1 defect is now caught by a test that needs **no parser at all**,
so it cannot be masked by the release cycle again.

### Remaining

- The waiver should reach zero once `wasm-release` republishes the catalog, at which point the
  `compile` shards have nothing to build. Because `wasm-needed.py` now hashes queries as well as
  revisions, this branch requires republishing every package anyway. Regenerate the file with
  `node packages/javascript/lumis/scripts/list-unverified-parsers.mjs`.
- `all-languages.test.ts` still has no per-language content assertion now that queries live in the
  language packages rather than the runtime package.
- `AGENTS.md` pins Emscripten to `4.0.15`, but `wasm-release.yml` and the new `queries.yml` use
  `EMSDK_VERSION: 5.0.3`. One of the two is wrong and should be reconciled.

---

## 3. `#offset!` support was removed, and the regression was blessed into fixtures — DONE

`events.ts` drops `applyOffset`, `pointToIndex`, `QueryCaptureOffset`, and
`CompiledHighlightConfig.injectionOffsets`. The Rust highlighter never implemented `#offset!`, so
this makes JS match Rust — by deleting the feature. Re-counted at `fdd756949`: **136 active
`#offset!` directives across 32 files** in `queries/processed/`, all now dead in every runtime.

Concrete result, from the branch's own regenerated fixture
(`fixtures/conformance/javascript-html-template-attribute-interpolation-basic`), source
`` html`<div class="${x}"></div>` ``:

```
main:  ${ -> punctuation.special   x -> variable   } -> punctuation.special
now:   $  -> punctuation.special   {  -> punctuation.bracket
       x  -> plain                 }  -> punctuation.bracket
       ... all wrapped in a spurious `variable` scope
```

In the rendered HTML the interpolation delimiters lose their colour entirely (`#50fa7b` → `#f8f8f2`).
The injected range now includes `${` and `}`, so the JS parser sees `${x}` — `$` as an
identifier followed by a block — instead of `x`. Same degradation in the two nested-HTML fixtures.

The fixtures were regenerated to accept this. That's the wrong direction: `#offset!` is used by
mdx (strips fence lines), qmljs, angular, and template-literal injections, and dropping it makes
the injected source syntactically wrong, not just differently coloured.

**Fixed.** `#offset!` is implemented in `crates/lumis-wasm-runtime/src/tree_sitter_highlight.rs`
and restored in `events.ts`, so every runtime applies it.

Neovim is the reference, and it applies the directive in **both** places. Verified by reading the
code path, not the comments:

- highlights: `highlighter.lua:406` -> `get_range` -> `apply_range_offset`
- injections: `languagetree.lua:1073` -> `get_node_ranges:903` -> `get_range` -> `apply_range_offset`

Note the stale TODO at `languagetree.lua:1087` claiming injections do not support offsets. The code
immediately above it does. Reading only the comment gives the wrong answer here.

Semantics, from `treesitter.lua:162`: add the four deltas to
`(start_row, start_col, end_row, end_col)`; if the shift inverts the range, **silently keep the
original**. The previous JavaScript implementation on `main` omitted that fallback; the new one has
it in both runtimes.

Scope in this repository: 130 live directives across 32 languages, plus 6 commented out upstream.

| Target | Count | Note |
| --- | ---: | --- |
| `@injection.content` | 126 | strips backticks, `${`/`}`, fence lines before the injected grammar parses |
| highlight captures | 4 | solidity import path, powershell regex and here-string, markdown_inline conceal |

125 of the 130 have zero row deltas, which is a plain byte-column shift; 5 use `1 0 -1 0` and have to
walk to the target line. Both paths are covered.

Because tree-sitter's Rust API leaves `#offset!` in `general_predicates` rather than parsing it into
`property_settings` like `#set!`, the directive is read from there and stored per
`(pattern_index, capture_index)`. Injection ranges take their outer bounds from the adjusted range
while children are still masked out from the node itself, matching `get_node_ranges`.

Verification:

- `mise run conformance-regen` un-blessed the 3 degraded fixtures, and all 15 regenerated files are
  now **byte-identical to `origin/main`** — the output this PR had regressed away from
- `mise run test-conformance` passes on all five runtimes: Rust 138, CLI 115, JavaScript WASM 115,
  browser 24 across Chromium/Firefox/WebKit, Elixir 115
- 4 new unit tests pin the arithmetic the fixtures do not reach: same-row byte shift, row walking,
  multi-byte rows walked by byte, and offsets that run off the document
- proven by injection, per `AGENTS.md`: disabling offset parsing in Rust fails 15 CLI conformance
  cases; short-circuiting `applyCaptureOffset` in JavaScript fails the same 15. Both restored.

One caveat worth recording: `main`'s Rust used this same offset-unaware highlighter, yet `main`'s
fixtures contain the offset-applied output. The likeliest explanation is that `crates/lumis/build.rs`
preprocessed queries differently before this PR moved that to generation time. That was not run to
ground. It does not affect the result — the branch without this change produced the degraded output,
and with it reproduces `main`'s byte-for-byte.

Also worth knowing for anyone touching the NIF: `mix compile` did **not** pick up the Rust
path-dependency change. Elixir conformance failed 15 cases against a stale `lumis_nif.so` until
`mix compile --force`, after which it passed 115/115.

---

## 4. Production risks worth a decision before release

### 4.1 `@latest` at runtime — won't fix, by design

Resolving `@latest` means a bad publish reaches every deployed client within the
one-hour metadata TTL, with no consumer-side pin to roll back to. That is the
cost of the feature rather than a defect: shipping parser and query updates
without a runtime release is the point of this change, and pinning versions in
the generated catalog would reintroduce exactly the release coupling it removes.

Integrity metadata does not help either. The SHA-256 is read from the same
`language.json` that `@latest` resolved, so a bad-but-self-consistent publish
verifies cleanly. The guard has to sit before publication, not after.

That guard is `queries.yml`: every language compiles its processed queries
against its pinned grammar and then runs them over that language's `samples/`
file, so a query that compiles but fails on real input is caught before the
package is built.

### 4.9 `formatVersion` removed from the runtime — DONE

`formatVersion` was two unrelated things sharing a name, with opposite verdicts.

**The runtime gate** lived in `language.json` and was read by *nothing* except two equality checks
(`package.rs`, `languages.ts`). Since neither runtime sets `deny_unknown_fields` — and JavaScript
ignores extra keys — additive format changes already worked; the gate was what blocked them. Against
`@latest` it guaranteed a simultaneous fleet-wide break on any bump, in exchange for catching one
narrow case: a semantics change with identical shape. Every other incompatible change is already
caught by structural validation, with a better message that names the missing field.

Removed. The format is now **additive-only by contract**, and compatibility is decided by the
document's shape. Both `LanguagePackage` doc comments record the reasoning so the gate is not
reintroduced, and the rule it implies: a change to the *meaning* of an existing field must ship as a
new field instead.

Safe to do now precisely because the v3 format has never been published — §2 measured "0 carrying
`language.json`". There is no deployed client expecting the field, in either direction.

**The release-time signal** is kept. `lumis.formatVersion` in the published npm `package.json` is
read by `scripts/wasm-needed.py` to decide whether an artifact needs republishing. No client ever
sees it, so it carries no fleet risk, and it covers an axis `definitionHash` does not: the artifact
*layout* changed while query content did not. That is what forces republication into a new package
shape.

Removed from: `LanguagePackage` (Rust) and its `UnsupportedFormat` error variant, the
`LANGUAGE_PACKAGE_FORMAT_VERSION` constant and its re-export, `crates/dev`'s generator, the CLI
registry, the Elixir NIF, the TypeScript interface and validator, and five test helpers. Kept in
`templates/wasm/package.json.template` and `scripts/wasm-needed.py`.

Verified: `cargo test --workspace` (all pass, first complete run), `mix test` (123 passed), JS
typecheck plus 359 passing tests, and `gen-language-catalog --check`.

### 4.2 Elixir highlighting throughput is now hard-capped at 4 threads — DONE

`packages/elixir/lumis/native/lumis_nif/src/lib.rs` builds a `WasmExecutor` with
`available_parallelism().min(4)` OS threads feeding a `sync_channel(workers * 2)`, on top of the
`Runtime`'s own `WorkerPool` (also `min(4)`). Two queues, and the outer one blocks the dirty
scheduler when full.

On a 32-core box, Lumis will use at most 4 threads for highlighting regardless of load.

**Fixed by deleting the pool rather than resizing it.** Every NIF is already
`schedule = "DirtyCpu"`, so calls arrive on a dirty CPU scheduler and were then handed to a private
thread, with the scheduler blocking on the reply — two queues where the narrow one decided
throughput. The runtime is now called directly and the BEAM sizes the parallelism, tunable with
`+SDcpu` like everything else on that VM.

The 8 MiB stacks were the pool's only justification, and they were not needed: with the executor
stack cut to 320 KB, the BEAM dirty-scheduler default, the full suite passes and 50,000-deep JSON
nesting still highlights. 200,000 does not overflow either, it times out, so throughput is the wall
rather than stack. `+sssdcpu` raises it if a grammar ever proves otherwise.

Measured on 10 cores, 16 concurrent highlights of the same document:

| | speedup over serial |
| --- | ---: |
| 4-thread pool | 4.44x |
| dirty schedulers | 5.75x - 5.95x |

The worker limit passed to `with_worker_limit` now matches `available_parallelism()`, so no caller
blocks waiting for an instance. That is affordable because a worker costs about 110 KB resident,
measured, against roughly 15 MB for each loaded language; the pool was never the memory driver.

`Runtime::new()`, which carried its own `min(4)`, was dead — no runtime, benchmark or example ever
called it. Removed.

### 4.3 `:global.trans` serializes parser loading across the whole cluster — DONE

`packages/elixir/lumis/lib/lumis/language_loader.ex:163` wraps language loading in
`:global.trans({__MODULE__, id}, ...)`. That is a **cluster-wide** lock, and the critical section
contains an HTTP download plus a file lock that waits up to 120 s. Loading a language on one node
blocks every other node. This is node-local work; use a node-local mechanism (GenServer, `:ets`,
`:persistent_term`).

Related: `Lumis.highlight/2` now performs blocking network I/O inside the caller
(`highlight_with_language_loading`), and re-runs the full native highlight after each load — for a
markdown doc with six injected languages that is seven full passes on first use. Combined with the
global lock, first traffic after a deploy is the worst case. `mix lumis.languages.cache`
should be the *documented default* for releases, not an option.

### 4.3a The seven passes are not the retry loop's fault — new

`crates/lumis-wasm-runtime/src/runtime.rs:382-424`. The root cause is narrower than "the retry loop
re-highlights", and the fix is cheap.

The injection callback records only the **first** unloaded language:

```rust
None if known.contains(id) => {
    if missing_language.is_none() {
        missing_language = Some(id.to_string());   // first one only
    }
    None
}
```

The highlighter then runs to completion, every event is materialised into `output`, and only then:

```rust
if let Some(language) = missing_language {
    return Err(RuntimeError::LanguageNotLoaded(language));   // output thrown away
}
```

So each pass discovers exactly one missing name out of however many the pass already walked past,
and a fully built `Vec<HighlightEvent>` is constructed purely to be discarded. Elixir
(`lib/lumis.ex:875-897`) then loads that one language and retries.

Two local changes:

- Collect **all** missing languages into a `Vec` and return them together, so Elixir can call
  `load_languages/1` once. Seven passes become two.
- Move the `missing_language` check **before** the event drain.

Neither requires touching the retry loop's structure.

### 4.4 The CLI reimplements the runtime instead of using it

`crates/lumis-cli/src/registry.rs` duplicates `colorize_bracket_pairs`, `rainbow_scope_index`,
bracket extraction, the file lock, and atomic write from
`crates/lumis-wasm-runtime/src/runtime.rs`, nearly verbatim. For a PR whose thesis is "one portable
language-loading architecture", there are now three separate state machines for
resolve → verify → cache (Rust CLI, JS, Elixir), each with different TTL, offline, and fallback
semantics, and three different on-disk layouts for the metadata cache. The parser filenames happen
to line up between Node and Elixir (`{name}-{version}-{sha}.wasm`) — if that is intentional
sharing, say so; if accidental, it will drift.

Also in the CLI:

- `Registry::new` (`registry.rs:50-53`) builds its own wasmtime `Config` and ignores
  `LUMIS_WASM_CACHE_DIR`, which `lumis_wasm_runtime::cached_engine()` honours. So `--data-dir` no
  longer isolates the compiled-module cache, contradicting the docs.
- `load_wasm_language` re-loads the grammar into the `WasmStore` on every `parse_tree`,
  `load_config`, and `rainbow_ranges` call, and `parse_tree`/`rainbow_ranges` each build a **fresh
  `WasmStore`** (each store instantiates the module and reserves a 128 MiB-max linear memory).
  `read_cached_parser` re-reads and re-SHA-256s the file every time. This is very likely why the
  committed numbers show `Lumis CLI` at **105 ms for one small file** (bat: 14.5 ms) and
  **583 ms for ten**. Cache `tree_sitter::Language` + `HighlightConfiguration` per package and
  reuse one store.

### 4.5 `crypto.subtle` is secure-context-only — DONE

`sha256Hex` called `globalThis.crypto.subtle.digest` unconditionally. Browsers withhold
`crypto.subtle` from non-secure origins, so `verifyWasm` threw `TypeError: Cannot read properties
of undefined (reading 'digest')` and **every** language load failed on `http://` pages (intranet,
LAN dev servers, some embedded webviews). `CacheStorage` was already guarded for exactly this
(`browser.ts` falls back to IndexedDB); `crypto.subtle` was not.

**Fixed.** `src/core/sha256.ts` is a self-contained SHA-256 used when `crypto.subtle` is
unavailable, so verification never weakens and never has to be opted out of. No new dependency and
no configuration.

The native path stays because it is not free to drop: on a 1.6 MiB parser `crypto.subtle` takes
1.3 ms against 35.9 ms, and `verifyWasm` runs on every load, cache hits included. Only one path
runs per environment, the same shape as `browser.ts` falling back from `CacheStorage` to
IndexedDB.

Per the porting rule in `AGENTS.md`, `test/sha256.test.ts` pins it against the implementation it
stands in for: the published test vectors, then `crypto.subtle` itself over every padding boundary
and 50 random inputs. A fourth test deletes `crypto.subtle` from `globalThis` and asserts
`verifyWasm` both accepts correct bytes and still rejects wrong ones. Restoring the unguarded call
turns that test red with the original `TypeError`.

### 4.6 Node loses its fast path with no replacement

`@lumis-sh/lumis-native` is deleted, not deprecated. From the branch's own benchmark history:

| 1 small Rust file | main | this branch |
| --- | ---: | ---: |
| Lumis JS native | 959 µs | *(removed)* |
| Lumis JS WASM | 56.2 ms | 57.8 ms |
| Shiki | 5.7 ms | 5.8 ms |

Node users on the native package take a **~60x** regression, and the remaining WASM path is
**~10x slower than Shiki** on the small-file case (and 4.4x on ten-files-one-language). The
committed `benchmarks/README.md` drops the native row entirely, so the regression is invisible in
the report. The package-size argument is strong and the direction is defensible, but this needs to
be stated in the PR body, the changelog, and an npm deprecation notice on
`@lumis-sh/lumis-native` — not just omitted.

`benchmarks/elixir-runtime.md` is a model of how to present this: honest numbers, both directions.
Do the same for JS.

### 4.7 The same `language.json` is accepted by Rust and rejected by JavaScript — new

**Reproduced, not inferred.** This is the clearest violation of "all runtimes produce the same
output": one input, two verdicts.

`LanguagePackage::validate` (`crates/lumis-wasm-runtime/src/package.rs:83`) and
`parseLanguagePackage` (`packages/javascript/lumis/src/core/languages.ts:213`) are two hand-written
validators for one format. Given a language entry with no `aliases` key and `parser.size: 0`:

```json
{ "formatVersion": 3, "packageName": "@lumis-sh/wasm-json", "version": "0.26.3",
  "definitionHash": "abc",
  "parser": { "name": "tree-sitter-json", "grammarName": "json",
              "sha256": "336154bf...0f3e", "size": 0 },
  "languages": { "json": { "highlights": "(string) @string" } } }
```

```
RUST: ACCEPTED (aliases=[], size=0)
JS:   REJECTED -> Invalid Lumis language package: @lumis-sh/wasm-json
```

Two independent causes:

- `PackagedLanguage::aliases` carries `#[serde(default)]` (`package.rs:37`), so a missing `aliases`
  key deserialises to an empty vector. TypeScript requires `Array.isArray(language.aliases)`
  (`languages.ts:240`) and throws.
- TypeScript requires `Number.isSafeInteger(parser.size) && parser.size > 0` (`languages.ts:235`).
  Rust never validates `size`; a zero-size package is accepted and only fails later inside
  `verify_wasm`, with a different error.

Today's generator always emits `aliases` and a non-zero size, so this is latent rather than live.
It matters because it is *structural*: the format has three validators — Rust, TypeScript, and
`PACKAGE_FORMAT_VERSION` in `scripts/wasm-needed.py` — and **no shared fixture corpus** pinning them
to each other. `crates/lumis-wasm-runtime/tests/catalog.rs` is 15 lines and does not cover it;
`package.rs` and the JS tests each exercise their own validator only.

`AGENTS.md` states the rule this breaks: *"Two copies of the same algorithm require a test that pins
them to each other."*

**Fixed.** Both documents are now rejected by both runtimes, and the class is closed rather than the
two instances.

`fixtures/language-packages/` holds 5 valid and 19 invalid documents covering the format gate,
required non-empty strings, path-segment safety on the values that become cache filenames, digest
shape, and the languages map. Two tests read the same corpus and must reach the same verdict on
every file:

- `crates/lumis-wasm-runtime/tests/language_package_corpus.rs` — the CLI and the Elixir NIF both
  validate through this crate
- `packages/javascript/lumis/test/language-package-corpus.test.ts` — Node and browser

Both assert a corpus-size floor, so a discovery bug that finds no fixtures fails rather than passes.
`scripts/wasm-needed.py` is not a third validator after all — it only compares `formatVersion` in
published npm metadata — so the corpus binds the two implementations that actually parse packages.

Alignment went toward the stricter reading in both cases, since the objective is safety:

- `PackagedLanguage::aliases` lost `#[serde(default)]`. JavaScript already required the field; Rust
  tolerating its absence was the divergence. No compatibility risk — no v3 package is published yet,
  and the generator always emits `aliases`.
- `validate()` now rejects `parser.size == 0`, which JavaScript already did. Previously the failure
  surfaced much later as a confusing `InvalidSize` from `verify_wasm`, and only in runtimes that got
  that far.

Proven by injection, per `AGENTS.md`:

| Injected fault | Result |
| --- | --- |
| restore `#[serde(default)]` on `aliases` | Rust corpus: 2 tests fail on `language-missing-aliases` |
| remove the `parser.size == 0` check | Rust corpus: 2 tests fail on `parser-size-zero` |
| drop JS `size` validation | JS corpus: 2 tests fail on `parser-size-zero` |
| normalise missing `aliases` to `[]` in JS | JS corpus: 2 tests fail on `language-missing-aliases` |

One note for whoever touches the JS validator next: with the explicit `Array.isArray(aliases)` check
removed, missing `aliases` is still rejected — but only incidentally, as a `TypeError` from calling
`.some()` on `undefined`. The explicit check is what makes the rejection intentional. Keep it.

Still worth doing later: generate both validators, or the schema they share, from one source. The
corpus makes drift fail loudly; it does not make drift impossible.

### 4.8 Package resolution precedence differs per runtime — new

Same inputs, different language package, therefore different queries and different output.

| Runtime | Order |
| --- | --- |
| CLI (`registry.rs:290-324`) | **fresh disk cache** → `LUMIS_WASM_PATH` → network |
| JavaScript (`languages.ts:521-562`) | **installed npm package** → disk cache → network |
| Elixir (`language_loader.ex:60-65`) | **bundled `priv/wasm`** → user cache → network |

In the CLI, `ensure_package` returns the cached copy when `fresh || offline()` *before* reaching
`fetch_package`, and `fetch_package` is the only place `source_asset()` — i.e.
`LUMIS_WASM_PATH` — is consulted. So for the CLI a warm cache beats the explicitly configured
local source; for JS and Elixir the local copy always wins.

Consequences:

- A user who pins a local parser set and also has a warm cache gets one package in Node and Elixir
  and a different one in the CLI, inside the same hour-long TTL window.
- `LUMIS_WASM_PATH` reads as an override but behaves as a fallback. The CLI's own conformance
  suite only works because `--data-dir` points at an empty temp directory.

**Fixed.** The CLI now consults `LUMIS_WASM_PATH` before the cache, matching Node and Elixir.

The order was never actually in dispute — `ARCHITECTURE.md:122` already documents it:

```text
installed/local language package -> persistent metadata cache -> current package metadata
```

The CLI was the one implementation violating its own documented architecture, so this is code
conforming to the docs rather than a new decision. No doc change was needed.

Changes in `crates/lumis-cli/src/registry.rs`:

- `ensure_package` calls a new `read_source_package` before the cache-freshness short-circuit.
- `LUMIS_WASM_PATH` is now resolved once into a `Registry::source_dir` field instead of being
  re-read from the environment on every call, so the precedence is testable and cannot change
  mid-process.
- `fetch_package` and `read_source_package` share one `parse_package` helper, which removes the
  duplicated UTF-8 → parse → name-match sequence.
- The local source is deliberately *not* written to the cache: it is consulted first on every call,
  so caching it would only add a copy that can go stale.

Parser *bytes* keep cache-first ordering in every runtime. That is already consistent, and safe,
because the parser cache is content-addressed by the digest the package declares — once the package
agrees, cache and local source hold byte-identical, verified content.

Pinned by `configured_local_source_outranks_a_fresh_cache`. Proven by injection: restoring the
cache-before-source order makes it fail with "the configured local source must win over a fresh
cache".

`LUMIS_WASM_PATH` turns out to be undocumented in `docs/`, `CONTRIBUTING.md`, and the CLI
README — it appears only in code, tests, and workflows. That limits the blast radius of the old
behaviour, but the Node "installed package" and Elixir `priv/wasm` paths it now matches *are*
user-facing. Worth documenting the whole chain in one place.

---

## 5. Medium

- **`buildNestedEvents` is a from-scratch re-port of the hardest algorithm in the project**
  (layer boundary merge, locals scoping, `nonLocalVariablePatterns`, `lastHighlightRange`) guarded
  by **16 conformance fixtures, 3 of which this PR changed and 0 of which it adds**. Add fixtures
  for locals/shadowing (Rust, JS, Go), multi-level injections, and at least one language per
  injection style before shipping.
- ~~**Double query execution.**~~ **Won't fix — measured.** `events.ts` runs both
  `query.matches()` and `query.captures()` on every layer. On an 11 KiB JSON document in Node:

  | phase | time |
  | --- | ---: |
  | `parser.parse()` | 2.55 ms |
  | `query.matches()` | 3.91 ms |
  | `query.captures()` | 3.84 ms |
  | full highlight | 23.55 ms |

  So the second pass is about 15% of a highlight, and that is the ceiling on any fix. The two calls
  are also not redundant: `captures()` carries Tree-sitter's stream order but not match identity,
  `matches()` the reverse, and the highlighter has to discard a whole match when a predicate fails
  exactly as the Rust reference does. `web-tree-sitter` additionally omits some valid captures from
  `matches()` (`events.ts:193`), so the two lists differ. Collapsing them means reimplementing that
  join for a sixth of the time, in the riskiest code in the file.

  The remaining ~13 ms is `buildNestedEvents` and formatting, which is where the next entry already
  points.
- **No cache eviction anywhere.** Node, CLI, and Elixir accumulate one file per
  `{parser, version, sha}` forever; browsers accumulate CacheStorage/IndexedDB entries. Content
  addressing means every upgrade leaves the old blob behind. There is no `lumis-wasm-cache --prune`
  and no documented retention story.
- **No unload/eviction for loaded languages.** `Runtime` grows monotonically, and each of the up-to
  4 worker `WasmStore`s instantiates every module it touches. `elixir-runtime.md` already shows
  +54.5% RSS after ten languages; a service rendering arbitrary languages will keep climbing with
  no way back.
- **`definitionHash` is inert at runtime.** It is validated non-empty and used in an Elixir dedupe
  key, but never compared to anything. It exists to drive `wasm-needed.py`; either verify it
  client-side or drop it from the runtime schema so it isn't mistaken for an integrity control.
- ~~**Two implementations of the same hash.**~~ **Removed.** `scripts/wasm-needed.py` is ported into
  `crates/dev` as the `wasm-needed` subcommand, reusing `language_definition_hash`,
  `packaged_languages` and `parse_npm_versions_json`. The Python file is deleted, so the hash exists
  once. The release `detect` job gains a Rust toolchain and a build cache, which is the cost of
  removing the duplicate rather than testing around it. Verified identical over all 113 parsers
  before deleting.
- ~~**`formatVersion: 3` is hardcoded in three places.**~~ Down to two after §4.9, both release-time
  and neither read by a client: `templates/wasm/package.json.template` and
  `PACKAGE_FORMAT_VERSION` in `scripts/wasm-needed.py`. They still have to agree — bumping the
  package layout means editing both, and disagreeing means the release tooling either republishes
  forever or never. Worth folding into the same fixture test as the `definitionHash` pair above.
- **Breaking CLI change, no alias:** `lumis parsers fetch` and `lumis parsers update` are replaced
  by `lumis parsers cache`. Needs a changelog entry and ideally a deprecated alias.
- **`lumis-build` output changed for every Lua pattern** as part of the §1 fixes. The crate is
  published, and while `convert_lua_matches` keeps its signature, its output is materially
  different — correct now, but different. `try_convert_lua_matches` and `LuaPatternError` are new
  public items. Treat this as release-sensitive and let the conventional-commit type reflect the
  behavior change rather than hand-editing the version.
- **Bundled browser apps never use installed language packages.** `import(packageName)` carries
  `webpackIgnore`/`turbopackIgnore`/`@vite-ignore`, so in a bundle it is a bare specifier the
  browser can't resolve — it always falls through to jsDelivr. Users who `npm install
  @lumis-sh/wasm-*` for self-hosting will be surprised. Document `withWasm()`/resolvers as the
  browser path.
- **Base64 inlining removed from `templates/wasm/index.js.template`.** Good for size, but consumers
  relying on the inlined form now need a bundler that understands
  `new URL(..., import.meta.url)`. Call it out as breaking.

## 6. Low / nits

New in the second pass:

- ~~**The lock deadline is shorter than the staleness threshold**~~ **Fixed.** Node's lock file now
  records the holder's host and pid, so a peer on the same machine takes over the instant that
  process dies rather than failing for the 180-second gap. A pid written on another host is never
  judged, because it means nothing there; that case is covered by making `LOCK_TIMEOUT_MS` exceed
  `LOCK_STALE_AFTER_MS`, so a waiter never gives up while it is already entitled to break the lock.

  All three runtimes now recover from a dead holder instead of waiting one out: Rust takes no file
  lock at all, Elixir monitors the holder, Node checks the pid.
- **`matchesSpecialCapture(name, base)` is `name === base`** (`languages.ts:338`) — a function
  wrapping `===`, called at 12 sites. It presumably used to do prefix matching. Inline it.
- **Inconsistent lock-poison handling in the CLI `Registry`**: `load_wasm_language` turns a poisoned
  mutex into an error (`registry.rs:231-234`) while `ensure_package`, `cached_package`, and the
  constructor use `.lock().unwrap()` (`registry.rs:293, 319, 330, 341`). Pick one.
- **Redundant lookup and an unreachable `expect` in the NIF**: `parse_language_package` already
  proves the key exists (`lib.rs:303-308`), then `resolve_language_package` looks it up again with
  `.expect("validated language package entry")` (`lib.rs:270`). Have `parse_language_package` return
  the `&PackagedLanguage` it resolved; the `expect` disappears with it. A panic in a NIF is worth
  removing even when unreachable.
- **Untrusted `checkedAt` can pin the JS metadata cache forever**: `readCachedLanguagePackage`
  (`languages.ts:468-483`) re-validates the package but takes `cached.checkedAt` as-is. A future
  timestamp — clock skew, a restored backup, a tampered cache file — makes
  `Date.now() - checkedAt < TTL` true indefinitely. Clamp to `<= Date.now()`.
- **Elixir re-downloads after a peer wrote identical content**: `refresh_package`
  (`language_loader.ex:83-97`) only reuses the freshly re-read file when `package_json != stale`, so
  two processes racing on an unchanged package both re-fetch. Drop the inequality; `fresh?(path)` is
  the condition that matters.

From the first pass:

- ~~`node-cache.ts`: in `withWasmCacheLock`, the `catch { continue; }` around `stat` skips both the
  deadline check and the 25 ms sleep, an unbounded 100%-CPU spin if `stat` keeps failing.~~
  **Fixed** with the lock rewrite above: a failed `stat` now yields age 0 and falls through to the
  deadline check and the sleep.
  Move the deadline check and sleep before the `continue`.
- `runtime.rs:437-443` (`cached_engine`): `Cache::from_file(None)` enables wasmtime's **default**
  on-disk cache for every library consumer with no opt-out. A library writing to `~/.cache/wasmtime`
  without being asked deserves a documented env kill-switch.
- `runtime.rs:197-205`: concurrent first callers each build a full `Engine` before `OnceLock::set`;
  losers discard theirs. Correct, but wasteful. `LazyLock` over a `Result` would be cleaner.
- `HighlighterRuntime.loadLanguage` de-dupes on `opts.definition.id` while
  `createLoadedLanguage` stores under `resolved.definition.id`. If a caller ever passes an alias,
  the language is rebuilt (new `Language.load` + `Parser` + `Query`) on every call. Resolve
  through `aliasMap` in `loadLanguage`.
- `snapshotCapturesWithMatches` assigns synthetic match indices to captures absent from
  `matches()`; those get `localDefinitionValueEnds = 0`, so a `local.definition` in a synthetic
  match matches references at any offset. Narrow edge case, but worth a comment or a guard.
- `catalog::find` and `LanguagePackage::language` are O(n) `eq_ignore_ascii_case` scans over 115
  entries plus aliases. Fine today; a `phf`/`HashMap` would be free.
- `browser.ts:23-29`: Safari detection by UA sniffing. The fallback is still correct when it
  misfires, so low risk — but note it in a comment as best-effort.
- `browser.ts:31-54`: `openWasmDatabase` memoizes `undefined` on `onblocked`, permanently disabling
  IndexedDB for the page session after one transient block.
- `.github/workflows/conformance.yml`: removing the "JavaScript native" matrix entry left its
  `rust: true` attached to "JavaScript Wasm". Harmless (it just installs Rust) but almost certainly
  unintended.
- `ARCHITECTURE.md` still says "The root `mise.toml` intentionally does not pin runtime versions";
  this PR adds `[tools] tree-sitter = "0.26"` to it.
- `CONTRIBUTING.md:117-118` still describes `crates/lumis/build.rs` as doing Lua-to-Rust conversion
  and `crates/lumis-cli/build.rs` as embedding query constants. Both are now false.
- `benchmarks/webgpu_compute_reduce.html` is a verbatim 1,397-line copy of MIT-licensed three.js
  source with no attribution or licence header next to it. `examples/wasm-runtimes/README.md`
  attributes it; `benchmarks/` does not. MIT requires the notice to travel with the copy.
- `sha2 = "0.11"` / `digest 0.11.2` coexist with `sha2 0.10.9` / `digest 0.10.7` in `Cargo.lock`.
  Two RustCrypto trait generations in one tree — intentional, but worth consolidating.

## 7. What's good

- The `language.json` package format is the right unit: parser + queries + integrity + provenance
  released atomically, so a query fix ships without a runtime release. That is a genuine
  improvement over the old split.
- `wasm-needed.py` hashing the full definition (rev + aliases + all four query files) instead of
  just the rev is exactly right — query-only changes now trigger republication.
- Moving Lua→regex conversion into `queries/processed` at generation time so every runtime
  consumes byte-identical queries is the correct call, and deleting the duplicate JavaScript
  converter was the right direction. The four §1 defects were in the translation, not the
  architecture, and are now fixed in that single shared implementation.
- `escape_regex_for_query_string` is a real correctness fix — the old Rust path emitted raw
  backslashes into `.scm` string literals.
- `is_safe_path_segment` / `isSafePackagePathSegment` validation on `version` and `parser.name`
  before they become cache filenames, with a test for `../` escape. Good instinct.
- Double-checked locking + atomic temp-file rename in all four cache implementations, with
  verify-on-read and delete-on-corruption.
- The `WorkerPool` design in `lumis-wasm-runtime` is correct: per-worker `WasmStore` over one
  shared `Engine` is exactly how tree-sitter's `ts_wasm_store_add_language` is meant to be used
  (modules are instantiated per store; `language_id` refcounts are atomic). Copy-on-write
  `Arc<HashMap>` for the catalog keeps `highlight()` off the write lock.
- Snapshotting captures to plain data before `tree.delete()` in `collectHighlightLayers` avoids the
  obvious use-after-free trap.
- `benchmarks/elixir-runtime.md` is honest and complete — both the 92.8% NIF size win and the
  20–37% warm slowdown, 4.9x first-highlight latency, and +54.5% RSS.
- Blocking release workflows on `main`/tags is a good catch.
- Docs, README, and RELEASE.md were updated in the same change, as the repo rules require.

Added in the second pass:

- Content-addressed parser filenames (`{name}-{version}-{sha256}.wasm`) mean an upgrade cannot
  silently overwrite a verified asset, and a corrupt entry is deleted on read rather than trusted.
- The CLI derives cache paths from the **static catalog** `package_name`, not the parsed one, so a
  hostile `packageName` cannot traverse even though `validate()` does not check it. That is the
  right layering, but it is currently implicit — worth a comment before someone "simplifies" it.
- The §2 waiver mechanism proved itself during this review: merging `main` moved five revisions and
  the test failed loudly instead of quietly checking less (§0). That is exactly the property
  `AGENTS.md` asks for.
- `RAINBOW_SCOPE_INDICES` (`runtime.rs:23`) and the CLI's `rainbow_scope_index`
  (`registry.rs:512`) are duplicated but do **not** diverge: both resolve against the same
  `HIGHLIGHT_NAMES` with the same `punctuation.bracket` fallback. Duplication to remove (§4.4), not
  a correctness bug.

---

## 8. On the first objective: reuse the Rust core — largely DONE

The pipeline existed three times. It now exists once in Rust, with one port.

**Shared, in `lumis-wasm-runtime`:**

- `brackets` — the scope list, depth mapping, `BracketPair`, `RainbowRange`, the
  query walk and `colorize_bracket_pairs`. The CLI and the pooled `Runtime` had
  byte-identical copies; merging them also caught the CLI re-resolving scope indices
  per call where the `Runtime` precomputed them.
- `store` — resolve, verify, cache, lock, atomic write, TTL freshness, content-addressed
  filenames and exact-version URLs, behind a `Fetcher` trait so hosts bring their own
  HTTP client and tests bring none.

**Who uses it:**

| | before | after |
| --- | ---: | --- |
| `crates/lumis-cli/src/registry.rs` | 716 | 327 — wasmtime setup and highlight config only |
| `crates/lumis-wasm-runtime/src/runtime.rs` | 793 | 678 |
| `packages/elixir/.../language_loader.ex` | 495 | 420 — no verify, write_atomic, replace_file, acquire_lock, clear_stale_lock, now_ms |

Elixir reaches the same code through NIFs that take explicit paths, because its
release layout is not the CLI's, and through split `lock_acquire`/`lock_release`,
because a closure cannot cross the FFI boundary. It keeps what is genuinely its
own: the configurable resolver hooks, the download, and the search order across
`priv/wasm` and the user cache.

The constants that were restated per runtime — 3600 s package TTL, 120 s lock
timeout, 300 s stale-lock threshold — are now named exports with one definition.

**What is left.** JavaScript still ports the pipeline, and that one is forced: the
browser cannot call Rust. `AGENTS.md` already prescribes the remedy — a test pinning
the port to the Rust original — and §4.7's shared fixture corpus is the start of it,
covering package validation. The cache state machine itself is not yet pinned that
way, so `node-cache.ts` and `core/languages.ts` remain the place drift could appear.

One smaller item remains: the CLI still compiles the bracket query per invocation
where the `Runtime` caches it per language in a `OnceLock`. That is a performance
gap rather than duplication -- both now call the same `bracket_pairs`.

The JavaScript port is also no longer wholly unpinned. `src/cache-timing.ts` is
held against `store.rs` by `test/cache-timing.test.ts`, which parses the Rust
`Duration::from_secs` constants and fails if either side moves. What remains
unpinned is the cache *state machine* -- the order of source, cache and network
lookups -- not the constants it runs on.

---

## 10. Review follow-ups

Raised during review, tracked here and fixed one at a time.

| # | Item | State |
| --- | --- | --- |
| 10.1 | Query shards: 8 → 10 | **DONE** — 10 shards |
| 10.2 | `rust.yml` pins `toolchain: '1.91'`; should be `stable` | **DONE** — `dtolnay/rust-toolchain@stable` with no override; `msrv:` inputs stay, they pin the MSRV job deliberately |
| 10.3 | Emscripten version read with an inline `python3 -c tomllib` hack; mise should report it | **DONE** — `mise exec -- printenv LUMIS_EMSDK_VERSION` |
| 10.4 | `wasmparser` is not on the latest version | **DONE** — 0.244 → 0.255 |
| 10.5 | `store.rs` uses a single CDN with no fallback | **DONE** — jsDelivr then unpkg, in all three runtimes |
| 10.6 | `LUMIS_WASM_OFFLINE` adds an env var; reduce instead | **DONE** — removed from all three runtimes, along with Elixir's `:wasm_offline`; see below |
| 10.7 | `write_atomic` is hand-rolled; check for a crate or std equivalent | **DONE** — `tempfile::NamedTempFile::persist`, 40 lines → 22 |
| 10.8 | `webgpu_compute_reduce.html` is vendored; the demo should not need it in-repo | **DONE** — all three demos read the vendored copy; MIT notice added |
| 10.9 | Elixir has two sources of truth for which languages to cache | **DONE** — the task reads :bundled_languages only |
| 10.10 | `Lumis.LanguageLoader` → `Lumis.Languages`, a proper context with a public `load` | **DONE** — Lumis.Languages with a public load/1 |

### 10.6 — the offline switch is gone; the other two stay

`LUMIS_WASM_OFFLINE` was removed. Network access is the expected case, and a
deployment that cannot reach the network caches its languages in advance, which
already works: a cached parser is served from disk and never fetched. The switch
only bought a *different error message* for the uncached case, at the cost of an
env var, an Elixir config key, two error variants, and a branch in three
codebases.

The other two stay:

| Variable | Read by | What breaks without it |
| --- | --- | --- |
| `LUMIS_WASM_CACHE_DIR` | Rust, JavaScript, Elixir | nowhere to persist |
| `LUMIS_WASM_PATH` | Rust only | `lumis parsers cache --directory` prefetches *into another directory*, so it needs somewhere to read from that is not the cache it is writing. Removing it fails `cache_parsers_to_temp_dir` and `cache_parsers_force_replaces_existing_file`. |

`SOURCE_DIR` looked redundant, since it shares an on-disk layout with the cache and the CLI tests copy fixtures into the data directory anyway. Conformance does pass without it. The two prefetch tests do not, and that is a real user-facing command rather than a test artifact.


---

## 9. Pre-merge checklist

1. ~~Fix `-` → `*?` (Lua quantifier position), `[^...]` negation, and `[%u]` nesting in
   `crates/lumis-build/src/lib.rs`; regenerate `queries/processed/` and diff every `#match?` line.~~
   **DONE** — see §1. 58 files, 119 predicates regenerated; conformance output unchanged.
2. ~~Add a non-skipping test that every processed `#match?`/`#not-match?` pattern compiles under
   both `RegExp` and `regex::bytes::Regex`, and make `query-compile.test.ts` fail instead of
   `return` when a parser is missing or at the wrong rev.~~ **DONE** — see §2. Wired into CI as
   `.github/workflows/queries.yml`.
Blocking:

3. Regenerate `unverified-parsers.json` for the five languages `main` moved, and decide consciously
   about a waiver covering 71% of the catalog (§0). The branch is red until this is done.
4. ~~Decide on `#offset!`: implement in Rust, or revert the JS removal.~~ **DONE** — implemented in
   Rust and restored in JS; see §3. All five runtimes pass conformance.
5. ~~Replace `@latest` with a pinned range.~~ **Won't fix** — see §4.1. The `formatVersion`
   half is closed by §4.9.
6. ~~Guard `crypto.subtle` for non-secure contexts.~~ **DONE** — see §4.5.
7. ~~Add the shared language-package fixture corpus and align the Rust/TS validators.~~
   **DONE** — see §4.7. 24 fixtures, two test suites, four injected faults.

Before release:

8. Return all missing injected languages at once, and check before draining events (§4.3a).
9. ~~Unify package resolution precedence across the three runtimes.~~ **DONE** — see §4.8. The CLI
   now matches the order `ARCHITECTURE.md` already documented.
10. ~~Make the Elixir worker cap configurable; replace `:global.trans` with a node-local lock.~~
    **DONE** — the cap is gone rather than configurable (§4.2), and `Lumis.Loader` replaced the
    cluster lock (§4.3).
11. Add conformance fixtures for locals/shadowing and multi-level injections before the
    `buildNestedEvents` rewrite lands (§5).
12. Publish an npm deprecation for `@lumis-sh/lumis-native`, and state the native→WASM performance
    delta in the PR body, changelog, and `benchmarks/README.md` (§4.6).
13. Cache `tree_sitter::Language` and `HighlightConfiguration` in the CLI `Registry`; honour
    `LUMIS_WASM_CACHE_DIR` there (§4.4).
14. ~~Pin `wasm-needed.py`'s `definitionHash` to `crates/dev`'s.~~ **DONE, better** — the script is ported into `crates/dev` as `wasm-needed`, so there is one implementation and nothing to pin.

Cleanup:

15. The §6 items, plus the stale `CONTRIBUTING.md` build.rs descriptions, the `ARCHITECTURE.md`
    mise claim, the conformance matrix `rust: true`, the Emscripten `4.0.15` vs `5.0.3`
    contradiction, and the three.js attribution.

Then:

16. Collapse the three cache pipelines into one (§8). This is the change that makes the PR's own
    thesis true.
