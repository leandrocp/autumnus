# API drift tracker

Lumis presents one mental model across Rust, the CLI, Elixir, and JavaScript.
Rust is the reference; where a runtime disagrees, the runtime moves unless Rust
is the one that is wrong.

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
the unspaced form, and so does JavaScript in every branch. The single spaced
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

**D4.** Rust models this as `Option<HighlightLinesStyle>` where `None` means no
style, and Elixir documents `style: nil` for exactly this. JavaScript types it
`style?: string`, so absent and "none" collapse. `string | null` separates them
the way an optional field should in TypeScript: absent takes the default, `null`
opts out.

**D5.** `HtmlMultiThemesBuilder::build` rejects all three. Elixir rejects empty
themes itself and inherits the other two through the builder. JavaScript builds
no formatter object, so it needs the checks at call time.

**D18.** `Lumis.Languages.guess/2` calls the same `Language::guess` that
`highlight/2` already uses when no language is given, so the two cannot answer
differently — a test pins them against one input. Bundle name matching that
landed alongside it compares normalized strings rather than
`String.to_atom/1`: atoms are never collected, so a name arriving from a request
would grow the atom table without bound. A test asserts `:erlang.system_info(:atom_count)`
is unchanged across fifty unknown names.

## Shape and naming

| # | Drift | Runtimes | Status |
| --- | --- | --- | --- |
| D9 | `available_languages` returns a tuple map (Rust, Elixir) or a record array with five extra fields (JavaScript) | all | fixed |
| D10 | `available_themes` returns full themes (Rust), names (Elixir), or `{name, appearance}` (JavaScript) | all | fixed |
| D11 | `highlight/2` is spec'd `{:ok, _}` and raises on every error path, so `highlight!/2` is the same function | Elixir | fixed |
| D12 | `Highlighter` names a per-language token iterator in Rust and a language registry in JavaScript | Rust vs JavaScript | accepted |
| D13 | `HighlightEvent` and `highlightEvents` are documented public API in JavaScript and `#[doc(hidden)]` in Rust, with a different payload (`scope_index` vs `scope`) | Rust vs JavaScript | fixed |

**D9/D10.** Rust is the reference but has the weakest shape here — positional
tuples and, for themes, an iterator of whole themes that Elixir and JavaScript
cannot mirror cheaply. Rust gets named record types and the old accessors are
deprecated rather than removed, matching how `.lang()` → `.language()` and
`formatter` → `formatters` were handled.

**D12 — accepted.** Renaming either side breaks a published API to remove a
collision that has never confused a caller in practice: the two never appear in
the same program. Recorded so the next reader does not "fix" one into the other.

**D13.** Rust's events are public and documented now, rather than
`#[doc(hidden)]` "exposed for conformance tooling". The payloads stay different
— Rust keeps `scope_index` because resolving a name per event costs more than
the formatters need — and `HighlightEvent::scope()` returns the name JavaScript
carries directly, so a custom formatter reads the same value in both.

## Documentation

| # | Drift | Runtimes | Status |
| --- | --- | --- | --- |
| D14 | `rainbow_brackets` is implemented on all five formatters everywhere and appears in no docs option table, no Elixir `@type formatter` variant, and no Elixir `@typedoc` option list | all | fixed |
| D15 | `css_variable_prefix` is missing from the Rust row of the `html_multi_themes` options table | docs | fixed |

## Structural

| # | Drift | Status |
| --- | --- | --- |
| D16 | `crates/lumis/src/formatter/html.rs` re-declares 15 of the 18 public functions in `crates/lumis-core/src/formatter/html.rs`, including a 199-line byte-identical `span_multi_themes_attrs`, while the function directly below it delegates | fixed |
| D17 | Nothing checks the option surface across runtimes. Conformance pins output for `language`, `theme` and `rainbowBrackets` only; `runtime-parity.test.ts` compares Node native against wasm inside JavaScript | fixed |

**D16** is where both D1 and D2 live, in two copies. It is fixed first so the
output fixes are written once.

**D17** is why everything above shipped. The fix is a checked-in option manifest
each runtime asserts against, so adding an option to a Rust builder fails Elixir,
JavaScript and the CLI until they catch up. Conformance fixtures cover output;
the manifest covers surface. Neither substitutes for the other.

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
