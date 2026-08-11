# API drift tracker

Lumis presents one mental model across Rust, CLI, Elixir, JavaScript in Node and
browsers, and Java. Rust is the reference; where a runtime disagrees, the
runtime moves unless Rust is the one that is wrong.

Java is developed in [`lumis4j`](https://github.com/roastedroot/lumis4j). Being
in a separate repository changes where a fix lands, not whether Java counts.
The Java findings below were checked against
[`23e9e85`](https://github.com/roastedroot/lumis4j/tree/23e9e8581eaf16c5fc3d46293426c422afcbf3b2).

This file tracks every known divergence, what was decided, and where the fix
landed. An entry leaves this file only when the drift is gone **and** something
in CI would notice if it came back.

Full reasoning for the original scan is in `API-PARITY-AUDIT.md`.

Status: `open` · `fixed` · `accepted` (a difference the runtimes genuinely
cannot share, with the reason recorded).

## Output correctness

| # | Drift | Runtimes | Status |
| --- | --- | --- | --- |
| D1 | `html_multi_themes` emits `--prefix-name: value;` with no default theme and `--prefix-name:value;` with one; JavaScript never emits the space | Rust, CLI, Elixir vs JavaScript | fixed |
| D2 | `html_multi_themes` iterates `HashMap<String, Theme>`, so CSS variable order is randomized per process and disagrees with JavaScript's insertion order | Rust, CLI, Elixir vs JavaScript | fixed |

**D1.** Rust is inconsistent with itself: the named-default branch already emits
the unspaced form, and so does JavaScript in every branch. The single-spaced
branch is the outlier, so Rust moves. Elixir's assertions in
`packages/elixir/lumis/test/lumis_test.exs` pin the spaced form and move with it.

**D2.** The `<pre class="...">` theme list is already sorted on both sides. The
style loops get the same treatment rather than a new ordered-map type in the
public API.

Neither is visible to `mise run test-conformance`: the only fixture with an
`htmlMultiThemes` block sets `defaultTheme: "light-dark()"`, and the harness's
fallback for every other fixture supplies a named default. Both branches skip
the code above. A fixture with `defaultTheme` omitted and three themes closes
that.

## Missing surface

| # | Drift | Runtimes | Status |
| --- | --- | --- | --- |
| D3 | `terminal` has no `background` or `width` | JavaScript | fixed |
| D4 | `highlightLines` cannot express "class, no inline style" | JavaScript | fixed |
| D5 | `html_multi_themes` accepts empty themes, an unknown `defaultTheme`, and `light-dark()` without `light`/`dark` themes | JavaScript | fixed |
| D6 | `highlight` has no `--pre-class`, `--italic`, `--include-highlights`, `--header`, and `--highlight-lines` takes no class or style | CLI | fixed |
| D7 | `:bundle_*` names work in `Languages.load/1` but not `Languages.cache/2`, the mix task, `cacheLanguages`, `lumis-wasm-cache`, or `lumis parsers cache` | Elixir, JavaScript, CLI | fixed |
| D8 | `guessLanguage` is implemented but not exported; `sanitizeThemeName` is not in `formatters/html`; `runtimeKind` is missing from the browser entry | JavaScript | fixed |
| D18 | Language detection is public as `Language::guess` in Rust and `guessLanguage()` in JavaScript, and unreachable in Elixir | Elixir | fixed |
| D24 | `lumis4j` exposes four of the five built-in formatters and only language, theme, and formatter selection; HTML Multi-Themes and the formatter-specific options are absent | Java | open |
| D25 | `lumis4j` has no public equivalent of language guessing or rich language/theme metadata, and its default-language path does not pass source text into Rust detection | Java | open |

**D4.** Rust models this as `Option<HighlightLinesStyle>` where `None` means no
style, and Elixir documents `style: nil` for exactly this. JavaScript types it
`style?: string`, so absent and "none" collapse. `string | null` separates them
the way an optional field should in TypeScript: absent takes the default, `null`
opts out.

**D5.** `HtmlMultiThemesBuilder::build` rejects all three. Elixir rejects empty
themes itself and inherits the other two through the builder. JavaScript builds
a mutable formatter object, so it validates both when the formatter is created
and again at the render boundary.

**D6.** CLI integration tests send the added wrapper, class, style, italic,
and highlight-attribute flags through each HTML formatter that accepts them and
assert the rendered HTML, so the help-surface check cannot pass with unwired
flags.

**D18.** `Lumis.Languages.guess/2` calls the same `Language::guess` that
`highlight/2` already uses when no language is given, so the two cannot answer
differently — a test pins them against one input. Bundle name matching that
landed alongside it compares normalized strings rather than
`String.to_atom/1`: atoms are never collected, so a name arriving from a request
would grow the atom table without bound. A test asserts `:erlang.system_info(:atom_count)`
is unchanged across fifty unknown names.

**D24/D25 — open.** Java's `Formatter` enum currently has Terminal, HTML
Inline, HTML Linked, and BBCode; `Highlighter.Builder` exposes only
`withLang`, `withTheme`, and `withFormatter`. `Lang` and `Theme` are enums rather
than the metadata records exposed elsewhere, and the WASM bridge calls
`Language::guess(Some(&lang), "")`, so selecting the default/plaintext language
cannot inspect the source. These remain open cross-repository parity work, not
accepted reasons to remove Java from the parity target.

## Detection behavior

| # | Drift | Runtimes | Status |
| --- | --- | --- | --- |
| D23 | Language hints, path separators, dotted extensions, case-bearing filename globs, leading content whitespace, and versioned or case-varied shebangs normalize differently | Rust, Elixir vs JavaScript | fixed |

**D23.** One checked-in detection corpus now runs through `Language::guess`,
`Lumis.Languages.guess/2`, and `guessLanguage()`. Rust trims explicit hints,
accepts both host and foreign-platform path separators plus dotted extensions,
compares normalized glob patterns, and normalizes interpreter names the same
way the JavaScript detection tables do. The corpus also pins plaintext hints as
explicit choices that override content detection.

## Shape and naming

| # | Drift | Runtimes | Status |
| --- | --- | --- | --- |
| D9 | `available_languages` returns a tuple map (Rust, Elixir) or a record array with five extra fields (JavaScript) | Rust, Elixir, JavaScript | fixed |
| D10 | `available_themes` returns full themes (Rust), names (Elixir), or `{name, appearance}` (JavaScript) | Rust, Elixir, JavaScript | fixed |
| D19 | `available_themes` named two different returns after D10: whole themes in Rust, a summary elsewhere, with a Rust-only `available_theme_info()` bolted on | Rust vs Elixir, JavaScript | fixed |
| D11 | `highlight/2` is spec'd `{:ok, _}` and raises on every error path, so `highlight!/2` is the same function | Elixir | fixed |
| D12 | `Highlighter` names a per-language token iterator in Rust and a language registry in JavaScript | Rust vs JavaScript | accepted |
| D13 | `HighlightEvent` and `highlightEvents` are documented public API in JavaScript and `#[doc(hidden)]` in Rust, with a different payload (`scope_index` vs `scope`) | Rust vs JavaScript | fixed |
| D20 | Plaintext has aliases and Emacs modes in JavaScript but empty metadata in Rust and Elixir, so explicit `text`, `txt`, or `plain` hints can detect different languages | Rust, Elixir vs JavaScript | fixed |
| D21 | Rust and Elixir sort `available_languages` by id while JavaScript appends plaintext after every parser | JavaScript | fixed |
| D22 | `availableThemes()` shares its generated array in every JavaScript runtime; browser `availableLanguages()` does too, while Node only shallow-copies records and still shares their nested arrays | JavaScript | fixed |

**D9.** Rust is the reference but had the weakest shape here — a map of
positional tuples, which Elixir copied. Rust gets a named `LanguageInfo` record
and the old accessor is deprecated rather than removed, matching how `.lang()` →
`.language()` and `formatter` → `formatters` were handled. `LanguageInfo` exists
because `Language` is a fieldless enum: the metadata has to come from somewhere.

**D10/D19.** The first pass gave Rust an `available_theme_info()` beside the
existing `available_themes()`, which left one name meaning two things and added a
`ThemeInfo` type only Rust had. Both are gone. `Theme` already carries `name` and
`appearance`, so Rust's `available_themes()` answers the cross-runtime question
natively and returns a superset; Elixir and JavaScript return the summary because
sending every theme's highlights across the NIF or the wire costs far more than
the call is worth. That asymmetry follows from the data model rather than from
drift, so it is recorded below rather than "fixed" into uniformity.

**D12 — accepted.** Renaming either side breaks a published API to remove a
collision that has never confused a caller in practice: the two never appear in
the same program. Recorded so the next reader does not "fix" one into the other.

**D13.** Rust's events are public and documented now, rather than
`#[doc(hidden)]` "exposed for conformance tooling". The payloads stay different
— Rust keeps `scope_index` because resolving a name per event costs more than
the formatters need — and `HighlightEvent::scope()` returns the name JavaScript
carries directly, so a custom formatter reads the same value in both.

**D20/D21.** Plaintext has no parser, but its metadata is still public API. It
remains an explicit special case in the Rust and JavaScript generators instead
of adding a non-parser section to `languages.toml`. Both expose the same aliases
and Emacs modes, and the shared detection corpus pins the behavior. The
JavaScript generator sorts the complete list after adding plaintext, matching
Rust and Elixir rather than depending on TOML insertion order. Parser-cache
entry points treat the id and every alias as a successful no-op because there
is no parser to fetch.

**D22.** JavaScript returns a fresh outer array, record, and nested arrays on
every call. A caller can edit its result without changing later catalog reads,
matching the value semantics callers get from Rust and Elixir and removing the
Node/browser difference.

## Documentation

| # | Drift | Runtimes | Status |
| --- | --- | --- | --- |
| D14 | `rainbow_brackets` is implemented on all five formatters in Rust, Elixir, JavaScript, and the CLI, but appears in no docs option table, no Elixir `@type formatter` variant, and no Elixir `@typedoc` option list | Rust, CLI, Elixir, JavaScript | fixed |
| D15 | `css_variable_prefix` is missing from the Rust row of the `html_multi_themes` options table | docs | fixed |

## Structural

| # | Drift | Status |
| --- | --- | --- |
| D16 | `crates/lumis/src/formatter/html.rs` re-declares 15 of the 18 public functions in `crates/lumis-core/src/formatter/html.rs`, including a 199-line byte-identical `span_multi_themes_attrs`, while the function directly below it delegates | fixed |
| D17 | Nothing checks the option surface across runtimes. Conformance pins output for `language`, `theme` and `rainbowBrackets` only; `runtime-parity.test.ts` compares Node native against wasm inside JavaScript | fixed |
| D26 | The shared formatter manifest and conformance fixtures have no Java consumer, so Java surface and output drift cannot fail either repository's CI | open |

**D16** is where both D1 and D2 live, in two copies. It is fixed first so the
output fixes are written once.

**D17** is why everything above shipped. The fix is a checked-in option manifest
each runtime asserts against. Rust also parses the five formatter structs in its
test, so adding a builder field cannot pass by leaving both the manifest and its
manual setter exercise unchanged. Once the manifest moves, Elixir, JavaScript,
and the CLI fail until they catch up. Conformance fixtures cover output; the
manifest covers surface. Neither substitutes for the other.

**D26 — open.** The manifest now protects every implementation in this
repository, but Java remains part of the contract. Close this by making
`lumis4j` consume the same formatter manifest and conformance fixtures (or an
equivalent versioned artifact), not by defining Java out of scope.

## What counts as drift, and what does not

Parity is about the **concept** a caller reaches for and the **shape** of what
comes back. Spelling is whatever the host language spells it.

Not drift, and not worth a tracker entry:

- **Case convention.** `pre_class` / `preClass` / `--pre-class` are one option.
- **Where the name hangs.** Detection is `Language::guess` in Rust, an
  associated function on the type it returns; `Lumis.Languages.guess/2` in
  Elixir, a function in the languages module; `guessLanguage()` in JavaScript,
  which has no namespace to hang it on and so carries the noun in the name. Each
  is the idiomatic placement for its language, and all three read as "guess the
  language". Forcing one spelling would make two of them unidiomatic.
- **Container types.** A Rust `HashMap`, an Elixir map and a JavaScript object
  are the same idea. So are a Rust tuple struct and a JavaScript object literal.
- **Arity and overloads.** Elixir has `highlight/2` and `highlight!/2` where
  Rust has one function returning `Result`; Rust takes `Option<&str>` where
  JavaScript takes an optional argument.
- **Richer returns where a runtime can afford them.** See D10/D19: Rust's
  `available_themes()` yields whole themes because they are already in the
  binary; the dynamic runtimes return a summary because the boundary is not
  free.

Drift, and tracked above:

- A concept one runtime can express and another cannot at all (D3, D4, D6).
- The same name meaning materially different things (D19).
- The same call returning shapes a caller cannot write one mental model against
  (D9).
- Validation, defaults or error behaviour that differ (D5, D11).

## Accepted differences

Not drift. Recorded so they are not re-litigated.

| Difference | Why |
| --- | --- |
| Browsers load languages before highlighting; every other runtime loads during the walk | `web-tree-sitter` loads asynchronously and cannot fetch inside a synchronous walk. `ARCHITECTURE.md` has the full reasoning. Do not make the other runtimes match the browser. |
| Rust and the CLI take a theme object or name; JavaScript takes only an object | `@lumis-sh/themes` publishes one module per theme so bundlers can drop the other 245. A name lookup would have to reference all of them. |
| `sanitize_theme_name` exists in Rust and JavaScript, not Elixir | It builds CSS custom property names, which only a formatter does. Elixir's formatters run inside the NIF, so nothing on the Elixir side would call it. |
| Elixir has no custom formatter API | Formatters run inside the NIF. A formatter written in Elixir would mean crossing the BEAM boundary per token. |
| Elixir loads languages globally to the VM; JavaScript loads per highlighter | One `Runtime` lives in the NIF, so the first process to need a language pays and every process after it does not. |
| Rust compiles languages in behind feature flags; the dynamic runtimes fetch them | Different distribution model, same catalog and the same bundle names. |
