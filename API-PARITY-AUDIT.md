# API parity audit

> **Historical.** This is the scan that opened the work, written before any of
> it was fixed, and it describes the code as it stood then. Line numbers, code
> quotes and "Fix:" notes are all pre-fix. `API_DRIFT.md` is the live tracker
> and says what was decided and where each fix landed; read that first. This
> file is kept for the evidence behind each finding.

Scan of the public surface of every runtime against Rust, the reference
implementation. Rust = `crates/lumis`, CLI = `crates/lumis-cli`, Elixir =
`packages/elixir/lumis`, JavaScript = `packages/javascript/lumis` (Node addon and
browser share one entry). Java (`lumis4j`) lives outside this repository and is
only covered where this repo's docs make claims about it.

Ordered by consequence, not by size.

## 1. Same formatter, same input, different bytes

### 1.1 `html_multi_themes` CSS variables: Rust emits a space, JavaScript does not

With no default theme — the mode the docs describe as "`nil` for CSS variables
only" — Rust formats every custom property as `--prefix-name: value;`:

- `crates/lumis-core/src/formatter/html.rs:263,266` (span attributes)
- `crates/lumis-core/src/formatter/html.rs:512,515` (`<pre>` style)
- duplicated at `crates/lumis/src/formatter/html.rs:394,397`

JavaScript formats it as `--prefix-name:value;` in both places, because
`pushThemeCssVars` and `buildNormalThemeVars` are used for every branch:

- `packages/javascript/lumis/src/formatter/html.ts:690,691,727,728`

Rust itself is inconsistent here: the *named* default-theme branch emits the
unspaced form (`crates/lumis-core/src/formatter/html.rs:229,233,500,503`), so
only the no-default-theme mode diverges.

The spaced form is pinned by `packages/elixir/lumis/test/lumis_test.exs:494`,
which asserts `--lumis-main: #abb2bf;` for
`{:html_multi_themes, themes: [main: "onedark"]}`. One theme is enough to trigger
it; no exotic configuration is required.

Conformance does not catch this. `fixtures/conformance/json-basic/fixture.json`
is the only fixture with an `htmlMultiThemes` block and it sets
`"defaultTheme": "light-dark()"`, which takes a branch that reads
`themes["light"]` / `themes["dark"]` by key and emits neither spelling. Every
other fixture falls into the harness's `else` arm, which injects a single theme
named `main` *with* `default_theme("main")`
(`crates/lumis/tests/formatter_conformance.rs:172-174`) — again the unspaced
branch.

**Fix:** make Rust unspaced everywhere (it already is in the more common branch),
update the Elixir assertions, and add a conformance fixture with `defaultTheme`
omitted.

### 1.2 `html_multi_themes` theme order is non-deterministic in Rust

`crates/lumis-core/src/formatter/html.rs:495,510` and `:353` (plus the duplicate
in `crates/lumis/src/formatter/html.rs:353,387`) iterate
`&HashMap<String, Theme>` directly. Rust's default hasher is seeded per process,
so with two or more themes reaching those loops the CSS custom properties come
out in a different order on every run — different from JavaScript, and different
from the previous run of the same binary.

JavaScript iterates `Object.entries(themes)`, which is insertion-ordered and
stable.

The `<pre class="...">` theme list is already sorted on both sides
(`crates/lumis-core/src/formatter/html.rs:457-458`,
`packages/javascript/lumis/src/formatter/html-multi-themes.ts:86`), so the fix is
the same treatment for the style loops: collect and sort, or take an ordered map.

Note this makes Elixir's public API lossy in a second way: it accepts an ordered
`keyword(theme())` and converts it to a `HashMap` before it reaches Rust
(`packages/elixir/lumis/lib/lumis.ex:559-579`), discarding the order the caller
expressed.

## 2. Missing API surface

### 2.1 JavaScript `terminal()` has no `background` or `width`

| | `language` | `theme` | `background` | `width` | `rainbow_brackets` |
|---|---|---|---|---|---|
| Rust | ✓ | ✓ | ✓ `TerminalBackground` | ✓ | ✓ |
| Elixir | ✓ | ✓ | ✓ `:theme \| String \| nil` | ✓ | ✓ |
| CLI | ✓ | ✓ | ✓ `-b` | ✓ `-w` | ✓ |
| JavaScript | ✓ | ✓ | **✗** | **✗** | ✓ |

`packages/javascript/lumis/src/types.ts:499-503` defines only three options and
`packages/javascript/lumis/src/formatter/terminal.ts` (37 lines) implements no
background fill or line padding. `docs/content/usage/formatters/terminal.mdx`
already records the gap in its options table, so this is known drift rather than
an oversight — but it is still the one formatter where a runtime cannot produce
output another runtime can.

### 2.2 JavaScript `highlightLines` cannot express "class only, no style"

Rust models the style as `Option<HighlightLinesStyle>` where `None` means emit no
inline style at all (`crates/lumis-core/src/formatter/html_inline.rs:122-134`).
Elixir passes that through and documents it:

```elixir
{:html_inline, highlight_lines: %{lines: [1, 2, 3], style: nil, class: "bg-yellow-500"}}
```

JavaScript types it as `style?: string`
(`packages/javascript/lumis/src/types.ts:306-311`) and treats a missing value as
"use the theme"
(`packages/javascript/lumis/src/formatter/html-inline.ts:46-52`). There is no
value a JavaScript caller can pass to get the class without the style.

### 2.3 CLI is missing most HTML formatter options

`lumis highlight` accepts `--language`, `--formatter`, `--theme`, `--background`,
`--width`, `--themes`, `--default-theme`, `--css-variable-prefix`,
`--highlight-lines`, `--rainbow-brackets`
(`crates/lumis-cli/src/main.rs:58-105`). It has no `--pre-class`, `--italic`,
`--include-highlights`, or `--header`, all of which the other runtimes
support on `html_inline` and `html_multi_themes` (and `--pre-class` / `--header`
on `html_linked` too). `--highlight-lines` also takes only line numbers — no
class or style, which the library API exposes on every other runtime.

### 2.4 Bundle names are accepted in some places and not others

`:bundle_web`, `:bundle_web_extra`, `:bundle_system`, `:bundle_backend`,
`:bundle_full` name the same language sets as the `@lumis-sh/wasm-bundle-*`
packages and the `lang-bundle-*` Cargo features, so the vocabulary is aligned.
What accepts it is not:

| | load | cache |
|---|---|---|
| Elixir | ✓ `Lumis.Languages.load(:bundle_web)` | **✗** `cache/2` stringifies the atom and hands `"bundle_web"` to the NIF, which fails (`packages/elixir/lumis/lib/lumis/languages.ex:131-147`) |
| `mix lumis.languages.cache` | — | **✗** only `--all` |
| JavaScript | ✓ via `createHighlighter({languages: [bundledLanguages]})` | **✗** `cacheLanguages` / `lumis-wasm-cache` take names or `--all` |
| CLI | — | **✗** `parsers cache` takes names or `--all` |

`load/1` and `cache/2` living in the same module and disagreeing about whether a
`:bundle_*` atom is a valid name is the sharpest instance.

### 2.5 Assorted single-runtime functions

| Function | Rust | Elixir | JavaScript | CLI |
|---|---|---|---|---|
| theme lookup by name | `themes::get` | `Lumis.Theme.get/1` | **✗** (import the module) | `--theme` |
| `sanitize_theme_name` | `formatters::html` | **✗** | root entry, not `formatters/html` | — |
| language guessing | `Language::guess` (public) | **✗** (implicit only) | `guessLanguage` exists but is not exported | implicit |
| `runtimeKind` | — | — | Node entry only, not browser | — |

The theme-lookup row matters most: Elixir and the CLI accept a theme *name*
wherever a theme is accepted, Rust and JavaScript require the object. Two
different mental models for the same option.

## 3. Shape and naming drift

### 3.1 `available_languages` returns a different shape per runtime

| Runtime | Return |
|---|---|
| Rust | `HashMap<String, (String, Vec<String>)>` — id → (name, globs) |
| Elixir | `%{id => {name, [extension]}}` — mirrors Rust |
| JavaScript | `LanguageInfo[]` — `{id, name, aliases, extensions, globs, emacsModes, shebangs}` |

JavaScript returns a list of records with five fields Rust and Elixir do not
expose at all. Rust returns a positional tuple, which is the weakest of the three
shapes and is what Elixir copied.

### 3.2 `available_themes` returns a different shape per runtime

| Runtime | Return |
|---|---|
| Rust | `impl Iterator<Item = &'static Theme>` — full themes |
| Elixir | `[String.t()]` — names only |
| JavaScript | `ThemeInfo[]` — `{name, appearance}` |

A caller writing "list the themes and group them by appearance" writes three
unrelated programs.

### 3.3 `Highlighter` names two unrelated concepts

Rust's `lumis::highlight::Highlighter` is a per-language, per-theme token
iterator constructed as `Highlighter::new(language, theme)`. JavaScript's
`Highlighter` (from `createHighlighter`) is a language registry that holds loaded
parsers and takes a formatter per call. Same name, no relationship.

### 3.4 `HighlightEvent` is public in JavaScript and hidden in Rust

`packages/javascript/lumis/src/types.ts:334-337` exports
`{type: "start", scope: string, language: string}` as documented public API, and
`highlightEvents` is part of the custom-formatter guide. The Rust equivalents are
`#[doc(hidden)]` with the note "Exposed for conformance tooling; not part of the
stable public API" (`crates/lumis/src/highlight.rs:104,405,412`), and the event
carries `scope_index: usize` rather than the scope name. Elixir exposes neither.

Pick one: either events are public everywhere (and Rust drops `doc(hidden)` and
exposes the scope name), or JavaScript's is marked unstable too.

### 3.5 `Lumis.highlight/2` can never return `{:error, _}`

`@spec highlight(String.t(), options()) :: {:ok, String.t()}` — and every
`{:error, _}` the NIF returns is converted into a `raise`
(`packages/elixir/lumis/lib/lumis.ex:857-880`). `highlight!/2` then does
`{:ok, x} = highlight(...)`. The bang and non-bang pair are the same function
with a different wrapper; neither honours the Elixir convention the pair implies.

Rust's `highlight()` panics and documents it, pointing callers at
`write_highlight()` for the fallible path; JavaScript rejects the promise. Elixir
is the only one with a shape that promises a fallible return it never produces.

### 3.6 `html_multi_themes` validation exists in Rust, partially in Elixir, not at all in JavaScript

Rust's `build()` rejects three things
(`crates/lumis/src/formatter/html_multi_themes.rs:262-282`): empty themes, a
`default_theme` not present in the map, and `light-dark()` without themes named
`light` and `dark`.

Elixir rejects empty themes at option-validation time
(`packages/elixir/lumis/lib/lumis.ex:543-557`) and inherits the other two from
the Rust builder, so they surface as errors from `highlight/2`.

JavaScript checks none of them. `defaultTheme: "typo"` silently produces a
`<pre>` with no color, and `defaultTheme: "light-dark()"` without a `light` theme
silently emits `light-dark(#000000, #ffffff)`
(`packages/javascript/lumis/src/formatter/html-multi-themes.ts:46-56`).

## 4. Documentation and typespec drift

### 4.1 `rainbow_brackets` is absent from every published option table

It is implemented on all five formatters in Rust, Elixir, and JavaScript, and as
`--rainbow-brackets` in the CLI. It appears in:

- **no** `## Options` table in `docs/content/usage/formatters/*.mdx` (all five files)
- **no** variant of Elixir's `@type formatter` (`packages/elixir/lumis/lib/lumis.ex:235-277`)
- **no** entry in Elixir's `@typedoc` "Available Options" list (`:106-145`)

Elixir's runtime schema does accept it (`:335,382,447,496,509`) and
`convert_formatter_for_nif` does forward it (`:1004-1053`), so the behaviour is
right and only the contract is missing. A caller reading the typespec cannot
discover the option.

### 4.2 The docs omit `css_variable_prefix` from the Rust row

`docs/content/usage/formatters/html-multi-themes.mdx` lists it for Elixir,
JavaScript, and the CLI but not Rust. Rust has it
(`crates/lumis/src/formatter/html_multi_themes.rs:196`), with the same `--lumis`
default.

## 5. Structural: nothing checks any of this

`mise run test-conformance` runs all five runtimes against
`fixtures/conformance/*`, which pins *output* for `language`, `theme`,
`rainbowBrackets`, and one `htmlMultiThemes` configuration. It pins nothing about
the option surface, so §2 and §3 are invisible to CI, and §1.1 slipped through
because the one fixture that could have caught it picks the other branch.

The only file named for parity,
`packages/javascript/lumis/test/runtime-parity.test.ts`, compares Node's native
addon against `web-tree-sitter` — inside JavaScript. There is no cross-language
equivalent.

Two things would close most of this:

1. **A checked-in formatter option manifest** that each runtime asserts against —
   the `unverified-parsers.json` pattern from `AGENTS.md`. Rust generates it from
   the builder fields; Elixir asserts its NimbleOptions schemas match; JavaScript
   asserts its option interfaces match; the CLI asserts its clap arguments match
   or declares a waiver. A new Rust builder field then fails three other runtimes
   until they catch up, instead of shipping.
2. **Conformance fixtures for the options that currently have none**: `preClass`,
   `italic`, `includeHighlights`, `header`, `highlightLines` with each `style`
   variant including `nil`, `background`, `width`, and `htmlMultiThemes` with
   `defaultTheme` omitted and with three themes.

## 6. Unrelated but found on the way: `crates/lumis` duplicates `crates/lumis-core`

`crates/lumis/src/formatter/html.rs` re-declares 15 of the 18 public functions
that already exist in `crates/lumis-core/src/formatter/html.rs`. Three delegate
(`span_inline`, `span_multi_themes`, `open_multi_themes_pre_tag`); the rest are
copies:

- byte-identical: `span_inline_attrs` (42 lines), `span_linked`, `span_linked_attrs`,
  `sanitize_theme_name`, `text_decoration`, **`span_multi_themes_attrs` (199 lines)**,
  `escape_braces`, `open_pre_tag`, `open_code_tag`, `close_code_tag`,
  `close_pre_tag`, `closing_tags`
- rewritten but output-equivalent: `escape` (byte-scanning variant),
  `wrap_line` (restructured `format!`), `scope_to_class` (`crate::` → `lumis_core::`)

`AGENTS.md` calls this out directly: "A second implementation of the same logic
in another language, or in another Rust crate, is a divergence that will drift."
`span_multi_themes_attrs` is where §1.1 and §1.2 both live, in two places, and
the function immediately below it already delegates — so the fix is mechanical.
