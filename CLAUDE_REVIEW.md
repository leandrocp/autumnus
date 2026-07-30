# Review: PR #1099 — `feat: unify dynamic WASM language loading`

Scope reviewed: 305 files, +11556/-5103, 26 commits, `main...lp-unified-wasm-languages`.

**Verdict: do not merge as-is.** The architecture is sound and the packaging win is real, but
three defects in this branch are user-visible breakage today, and one of them is a hard crash.
All three are independently reproducible with the commands below. Separately, the branch removes
the only Node fast path and the test that would have caught the crash, which is why CI is green.

This document is a living guideline. Items are fixed in place and marked **DONE** only once a
reproducible test pins the behavior.

## Status

| Item | State |
| --- | --- |
| 1.1 Clojure throws on load in JS | **DONE** |
| 1.2 Negated character classes inverted | **DONE** |
| 1.3 Nested classes diverge between Rust and JS | **DONE** |
| 1.4 `.` and mid-pattern `$` mistranslated (found while fixing 1.1) | **DONE** |
| 1.6 Query-string escapes not resolved before translation | **DONE** |
| 1.7 Two dead query patterns in `vim` and `sql` | **DONE** |
| 2 Query compilation silently skips 67% of languages | **DONE** |
| 3 `#offset!` removed, regression blessed into fixtures | open |
| 4.x Production risks | open |
| 5, 6 Medium / low | open |

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

- `crates/lumis-build/src/lib.rs` — 34 unit tests, 3 doctests
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
  and fall back to `$LUMIS_WASM_SOURCE_DIR/parsers/` then `tmp/wasms/` when the package is missing
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

## 3. `#offset!` support was removed, and the regression was blessed into fixtures

`events.ts` drops `applyOffset`, `pointToIndex`, `QueryCaptureOffset`, and
`CompiledHighlightConfig.injectionOffsets`. The Rust highlighter never implemented `#offset!`, so
this makes JS match Rust — by deleting the feature. There are **130 active `#offset!` directives**
in `queries/processed/` that are now dead in every runtime.

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

Recommendation: implement `#offset!` in `crates/lumis-wasm-runtime/src/tree_sitter_highlight.rs`
and restore it in JS, or explicitly scope it out of this PR and revert the JS removal so nothing
regresses while the architecture lands.

---

## 4. Production risks worth a decision before release

### 4.1 `@latest` at runtime is the biggest architectural change nobody has flagged

Three independent implementations resolve language metadata from a floating tag:

- `packages/javascript/lumis/src/core/languages.ts:170`
- `crates/lumis-cli/src/registry.rs:357`
- `packages/elixir/lumis/lib/lumis/language_loader.ex:341`

```
https://cdn.jsdelivr.net/npm/<pkg>@latest/language.json
```

On `main`, `WasmRef.version` was baked into the shipped runtime package, so a deployed build was
reproducible. Now every deployment resolves whatever is newest, with a 1-hour TTL.

- The SHA-256 check is **not** a pinned trust anchor. The digest comes from the same
  `language.json` that `@latest` served, so it protects against a corrupted transfer or cache, not
  against a bad or compromised publish. Worth saying plainly in the docs, which currently imply
  stronger guarantees than this provides.
- A single bad language-package publish propagates to every running deployment within an hour,
  with no client-side pin and no rollback lever short of unpublishing.
- `LANGUAGE_PACKAGE_FORMAT_VERSION` is a hard equality check
  (`package.rs:84`, `languages.ts:223`). The day a package publishes `formatVersion: 4`, **every
  already-deployed older client breaks**, because they all follow `@latest`. There is no
  negotiation, no `@format-3` dist-tag, and no `language.v3.json` path. This needs solving before
  the format can ever be bumped.
- Warm-cache-then-offline is the safe pattern and works. Warm-cache-then-*online* does not: a
  publish between image build and pod start invalidates every prefetched parser and re-downloads
  at runtime. Document this; it is the failure mode people will actually hit.

Minimum ask: publish under a format-scoped dist-tag, accept a version *range*, and make the
version resolvable/pinnable by the consumer.

### 4.2 Elixir highlighting throughput is now hard-capped at 4 threads

`packages/elixir/lumis/native/lumis_nif/src/lib.rs` builds a `WasmExecutor` with
`available_parallelism().min(4)` OS threads feeding a `sync_channel(workers * 2)`, on top of the
`Runtime`'s own `WorkerPool` (also `min(4)`). Two queues, and the outer one blocks the dirty
scheduler when full.

On a 32-core box, Lumis will use at most 4 threads for highlighting regardless of load. The
previous NIF ran on the dirty CPU schedulers directly. The 8 MiB stacks are a legitimate reason to
own the threads; the `min(4)` cap is not, and there is no config knob. Make it configurable and
default to `available_parallelism()`.

### 4.3 `:global.trans` serializes parser loading across the whole cluster

`packages/elixir/lumis/lib/lumis/language_loader.ex:163` wraps language loading in
`:global.trans({__MODULE__, id}, ...)`. That is a **cluster-wide** lock, and the critical section
contains an HTTP download plus a file lock that waits up to 120 s. Loading a language on one node
blocks every other node. This is node-local work; use a node-local mechanism (GenServer, `:ets`,
`:persistent_term`).

Related: `Lumis.highlight/2` now performs blocking network I/O inside the caller
(`highlight_with_language_loading`), and re-runs the full native highlight after each load — for a
markdown doc with six injected languages that is seven full passes on first use. Combined with the
global lock, first traffic after a deploy is the worst case. `mix lumis.parsers.cache` +
`:wasm_offline` should be the *documented default* for releases, not an option.

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

### 4.5 `crypto.subtle` is secure-context-only — parser loading breaks on plain HTTP

`languages.ts:318` calls `globalThis.crypto.subtle.digest` unconditionally. In browsers
`crypto.subtle` is `undefined` on non-secure origins, so `verifyWasm` throws a `TypeError` and
**every** language load fails on `http://` pages (intranet, LAN dev servers, some embedded
webviews). `CacheStorage` is guarded for exactly this (`browser.ts:19` falls back to IndexedDB);
`crypto.subtle` is not. On `main` there was no digest at all, so this is a new failure mode.

Decide the policy explicitly: fail closed with a clear error, or fall back to size-only
verification with a warning. Don't `TypeError`.

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

---

## 5. Medium

- **`buildNestedEvents` is a from-scratch re-port of the hardest algorithm in the project**
  (layer boundary merge, locals scoping, `nonLocalVariablePatterns`, `lastHighlightRange`) guarded
  by **16 conformance fixtures, 3 of which this PR changed and 0 of which it adds**. Add fixtures
  for locals/shadowing (Rust, JS, Go), multi-level injections, and at least one language per
  injection style before shipping.
- **Double query execution.** `snapshotCapturesWithMatches` runs both `query.matches()` and
  `query.captures()` on every layer, then builds a three-level `Map<pattern, Map<nodeId,
  Map<name, queue>>>`. On `main`, `matches()` ran only when `injectionPatternEnd > 0`. Files with
  no injections now pay a second full query pass plus the map construction. Worth measuring.
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
- **Two implementations of the same hash.** `scripts/wasm-needed.py:definition_hash` and
  `crates/dev/src/main.rs:language_definition_hash` must agree byte-for-byte or CI either
  republishes forever or never. They currently agree, with one divergence: for a `brackets.scm`
  that exists but is empty, Rust substitutes the default query and Python does not. Add a test that
  pins both against a fixture.
- **`formatVersion: 3` is hardcoded in `templates/wasm/package.json.template`** while
  `LANGUAGE_PACKAGE_FORMAT_VERSION` lives in Rust and `PACKAGE_FORMAT_VERSION` in Python. Three
  copies.
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

- `node-cache.ts:113-114`: in `withWasmCacheLock`, the `catch { continue; }` around `stat` skips
  both the deadline check and the 25 ms sleep. If `open` keeps returning `EEXIST` while `stat`
  keeps failing (EACCES on a shared cache dir), this is an unbounded 100%-CPU spin with no timeout.
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

---

## 8. Pre-merge checklist

1. ~~Fix `-` → `*?` (Lua quantifier position), `[^...]` negation, and `[%u]` nesting in
   `crates/lumis-build/src/lib.rs`; regenerate `queries/processed/` and diff every `#match?` line.~~
   **DONE** — see §1. 58 files, 119 predicates regenerated; conformance output unchanged.
2. ~~Add a non-skipping test that every processed `#match?`/`#not-match?` pattern compiles under
   both `RegExp` and `regex::bytes::Regex`, and make `query-compile.test.ts` fail instead of
   `return` when a parser is missing or at the wrong rev.~~ **DONE** — see §2. Wired into CI as
   `.github/workflows/queries.yml`.
3. Decide on `#offset!`: implement in Rust, or revert the JS removal. Do not ship the
   template-literal regression.
4. Replace `@latest` with a format-scoped dist-tag or an accepted version range, and add a
   consumer-visible pin. Resolve how a `formatVersion` bump reaches already-deployed clients.
5. Guard `crypto.subtle` for non-secure contexts.
6. Make the Elixir worker cap configurable; replace `:global.trans` with a node-local lock.
7. Add conformance fixtures for locals/shadowing and multi-level injections before the
   `buildNestedEvents` rewrite lands.
8. Publish an npm deprecation for `@lumis-sh/lumis-native`, and state the native→WASM performance
   delta in the PR body, changelog, and `benchmarks/README.md`.
9. Cache `tree_sitter::Language` and `HighlightConfiguration` in the CLI `Registry`; honour
   `LUMIS_WASM_CACHE_DIR` there.
10. Fix the stale `CONTRIBUTING.md` build.rs descriptions, the `ARCHITECTURE.md` mise claim, the
    conformance matrix indentation, and the three.js attribution.
