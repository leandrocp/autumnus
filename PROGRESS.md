# CLI option organization: research and decision

**Status: implemented in [#1267](https://github.com/leandrocp/lumis/pull/1267).**
Candidate D was chosen; A, B and C were rejected for the reasons recorded below.
Everything the CLI does today is in `crates/lumis-cli/`, and this file is kept as
the reasoning behind it rather than as a plan.

Research was done against
[`6172edea`](https://github.com/leandrocp/lumis/commit/6172edeac33c824cb56dee3793a4fd619ab66ff8),
the merge commit of #1266. Where the text below describes current behaviour in
the present tense, read it as the state *before* #1267: `-h` was
`--highlight-lines` and is now `--help`, `--highlight-lines` moved to `-H`, and
the 42 silently ignored combinations are now errors. The "Secondary findings"
table records which of those shipped.

## The question

[#1266](https://github.com/leandrocp/lumis/pull/1266) closed the CLI's half of
the API parity gap by adding `--pre-class`, `--italic`, `--include-highlights`,
`--header-open` / `--header-close`, `--highlight-lines-class` and
`--highlight-lines-style` to `lumis highlight`, and moved the argument list into
a flattened `HighlightArgs`. Parity is right and worth keeping.

What it also did is grow a single flat namespace to 17 flags, most of which
belong to *one* formatter. Pass `--pre-class` with `--formatter terminal` and
the parser accepts it, the renderer ignores it, and the command exits 0.

So: keep API parity, apply CLI semantics.

## Shape of the problem

Options and the formatters that actually consume them, read off
`fixtures/formatter-options.json` and confirmed against `render_output`,
`inline_highlight_lines`, `linked_highlight_lines` and `header_element` in
`crates/lumis-cli/src/main.rs` at the merge commit
[`6172edea`](https://github.com/leandrocp/lumis/commit/6172edeac33c824cb56dee3793a4fd619ab66ff8).

| Flag | html-inline | html-linked | html-multi-themes | terminal | bbcode-scoped |
| --- | :-: | :-: | :-: | :-: | :-: |
| `--language` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `--rainbow-brackets` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `--theme` | ✓ | · | · | ✓ | · |
| `--pre-class` | ✓ | ✓ | ✓ | · | · |
| `--header-open` | ✓ | ✓ | ✓ | · | · |
| `--header-close` | ✓ | ✓ | ✓ | · | · |
| `--highlight-lines` | ✓ | ✓ | ✓ | · | · |
| `--highlight-lines-class` | ✓ | ✓ | ✓ | · | · |
| `--italic` | ✓ | · | ✓ | · | · |
| `--include-highlights` | ✓ | · | ✓ | · | · |
| `--highlight-lines-style` | ✓ | · | ✓ | · | · |
| `--themes` | · | · | ✓ | · | · |
| `--default-theme` | · | · | ✓ | · | · |
| `--css-variable-prefix` | · | · | ✓ | · | · |
| `--background` | · | · | · | ✓ | · |
| `--width` | · | · | · | ✓ | · |

16 formatter-affecting flags × 5 formatters = 80 cells. 38 do something.
**42 combinations are accepted and silently discarded.** `lumis highlight -f
bbcode-scoped -t dracula --italic --pre-class x main.rs` is four flags, three of
them dead, exit 0.

Three things about that table constrain what a fix can look like:

- **Only two options are universal.** `--language` and `--rainbow-brackets`.
  Everything else is scoped, including `--theme`, which is one of the four steps
  in the mental model the repo documents (language → theme → formatter → render)
  and yet is a no-op for `html-linked` and `bbcode-scoped`.
- **The scopes overlap and do not nest.** `--theme` spans html-inline and
  terminal. `--italic` spans two of the three HTML formatters, `--pre-class` all
  three. There is no clean partition to name.
- **The applicability is per-formatter, not per-family.** `--highlight-lines-style`
  is HTML-only *and* not html-linked. Any scheme keyed on a family prefix still
  under-specifies.

## Deep dive: mise

You named mise as the model, so this is where most of the research went. mise is
the right comparison: 60+ commands, and one command (`mise run`) with more flags
than `lumis highlight` has.

### mise groups commands, and separately keeps flags flat

`mise --help` lists 60 commands with no visual grouping at all. `gh` does group
commands (`CORE COMMANDS`, `GITHUB ACTIONS COMMANDS`, `ADDITIONAL COMMANDS`) via
cobra's `AddGroup`. Both group by **object or verb**: `gh pr`, `gh issue`,
`mise install`, `mise settings`.

Lumis already has that shape and it is correct: `lumis highlight`, `lumis themes`,
`lumis languages`, `lumis parsers`, `lumis dump`. Nothing here argues for
changing it.

But a formatter is neither an object nor a verb. It is a rendering mode of one
verb. mise makes the same call in the same place: `mise run` picks its shell with
`--shell`, not with `mise run bash` / `mise run zsh`.

### The `--affected-*` family is the pattern lumis already half-adopted

`src/cli/run.rs`:

```rust
/// Run matching tasks only for projects affected by Git changes
#[clap(long, verbatim_doc_comment)]
pub affected: bool,

/// Git base revision for --affected
/// Defaults to MISE_AFFECTED_BASE, CI metadata, or HEAD~1
#[clap(long, requires = "affected", value_name = "REV", verbatim_doc_comment)]
pub affected_base: Option<String>,

/// Explain why projects and tasks were selected by --affected
#[clap(long, requires = "affected", conflicts_with = "affected_json", verbatim_doc_comment)]
pub affected_explain: bool,
```

Shared prefix, `requires` binding the family to its head flag, `conflicts_with`
between siblings, and each doc comment naming where the default comes from.
There is a second family right below it (`--allow-env`, `--allow-net`,
`--allow-read`, `--allow-write`, and matching `--deny-*`).

PR #1266 already did exactly this for `--highlight-lines-class requires =
"highlight_lines"` and the `--header-open` / `--header-close` pair. That part is
already mise-shaped.

**The reason it does not extend to the formatter is structural.** `requires` and
`conflicts_with` key on another argument's *presence*. `--affected` is a boolean,
so it works. Lumis's discriminator is `--formatter <VALUE>`, and clap has no
`conflicts_with_if_eq`. Confirmed against the `clap::Arg` docs: `required_if_eq`
and friends exist for *required*, and there is no value-conditional *conflict*
API at all.

### mise uses `help_heading` exactly where the flag count justifies it

`mise run` has ~20 flags and no headings. `mise install`, `mise use`, `mise ls`,
`mise config`, `mise tasks` all have none either.

`mise watch` does, and it is the only one:

```rust
const OPTSET_FILTERING: &str = "Filtering";
const OPTSET_COMMAND: &str = "Command";
const OPTSET_DEBUGGING: &str = "Debugging";
const OPTSET_OUTPUT: &str = "Output";
```

Rendered as `Filtering:`, `Output:`, `Command:`, `Debugging:` sections. Headings
declared as named constants rather than inline string literals, which is worth
copying: rename once, and a validation table can key off the same constant.

So mise's rule is roughly "flat until it hurts, then headings." `lumis highlight`
has 17, which is on the fence by pure count. What pushes it over is that mise's
20 are all applicable at once and lumis's 17 are not.

### 171 settings that are not flags

`mise settings ls -a` prints **171** settings. None of them are flags on
`mise run` or `mise install`. They live in `mise.toml`, in `MISE_*` env vars, and
behind `mise settings get/set/unset/add/ls`.

All 171 are declared in a single **3,360-line `settings.toml`** whose first line
reads:

```toml
# This file generates code and documentation for settings in mise
# When this file is updated, run `mise run render` to update generated files
```

Each entry carries `description`, long-form `docs`, `env`, `type`, `rust_type`,
`default`, `optional`, `parse_env`, and the names are dot-namespaced
(`age.key_file`, not `age_key_file`).

This is the most transferable finding in the whole document.
`fixtures/formatter-options.json` is already lumis's `settings.toml` — a single
declarative file describing an option surface. mise proves the model scales to
171 entries and generates both code and docs from it. Lumis currently generates
nothing from its manifest; it only *checks* against it.

### One spec, three consumers, including agents

`src/cli/usage.rs` converts the clap `Command` tree into a
[usage](https://usage.jdx.dev/) spec, then patches in everything clap cannot
express (default subcommand, mounts, restart tokens, per-command effects). That
one spec drives shell completions, the docs site, and `mise mcp`. The comment on
it:

> mise's own usage spec, with everything clap cannot express applied. Shared with
> `mise mcp`, which answers "what does this command do" from the same `effect=`
> data this prints. **Two constructions would drift, and the one an agent reads
> is the one that must not.**

`src/cli/command_effects.rs` classifies all 400-odd command paths as `read` /
`write` / `destructive`, and explains why it is one table rather than
annotations:

> Keeping it in one table is deliberate: a safety classification is much easier
> to review as a single list than as annotations scattered over sixty files.

That is a direct argument for lumis's applicability table being one generated
table rather than 16 hand-written `#[arg(...)]` annotations.

Also worth recording: **even `usage`, a CLI spec language purpose-built by mise's
author, has no way to say "this flag is only valid when that flag has this
value."** I checked the spec docs specifically for it. If the format designed by
someone with this exact problem does not express it, post-parse validation is not
a workaround, it is the state of the art.

## Deep dive: clap and the projects using it

### uv is the reference implementation of grouped options

`crates/uv-cli/src/lib.rs` is 7,767 lines with **116 `#[command(flatten)]` sites
and 91 `help_heading` uses**. The structure:

- Options are factored into reusable `#[derive(Args)]` structs: `GlobalArgs`,
  `IndexArgs`, `ResolverArgs`, `InstallerArgs`, `BuildOptionsArgs`, `RefreshArgs`,
  `ReinstallArgs`, `RegistryClientArgs`, `BuildIsolationArgs`, `SourcesArgs`,
  `CompileBytecodeArgs`, `CacheArgs`. Each subcommand flattens the ones it needs.
- Structs nest: `InstallerArgs` flattens `IndexArgs`, `ReinstallArgs`,
  `RegistryClientArgs`, `BuildIsolationArgs`, `SourcesArgs`.
- **`help_heading` is set per field, not per struct**, and deliberately so:
  `InstallerArgs` has fields under both `"Build options"` and
  `"Installer options"`. The struct is the *composition* unit; the heading is the
  *presentation* unit. Keeping them independent is what lets a shared struct
  render sensibly in every command that flattens it.
- `next_display_order = 1000` pushes `Global options` to the bottom.

Rendered, `uv run --help` gives `Index options:`, `Resolver options:`,
`Installer options:`, `Build options:`, `Cache options:`, `Python options:`,
`Global options:`.

### What uv's relational-constraint usage says

Counted across the same file:

| API | Uses |
| --- | --- |
| `conflicts_with` | 209 |
| `overrides_with` | 174 |
| `conflicts_with_all` | 41 |
| `requires` | 13 |
| `group(...)` | 12 |
| `overrides_with_all` | 4 |
| `required_if_eq` | 1 |

Two things fall out. `overrides_with` is used almost as much as `conflicts_with`,
because uv's `--foo` / `--no-foo` pairs resolve last-wins instead of erroring —
worth knowing, though lumis has no boolean pairs yet. And the only
value-conditional API clap offers, `required_if_eq`, is used **once** in the
largest clap CLI there is. Nobody is expressing value-conditional relationships
in clap, because clap cannot.

### What clap can and cannot do here, verified

Prototyped in `/tmp/clapproto` against clap 4.6.4.

| Question | Answer |
| --- | --- |
| `next_help_heading` on a flattened `Args` struct groups its fields | yes |
| `requires` resolves across a `flatten` boundary | yes, verified: `--highlight-lines-style` in one struct requiring `--highlight-lines` in another errors correctly |
| conflict conditional on another arg's *value* | **no such API** |
| help contents vary by a parsed value | no, help is static |
| `clap_complete` static completions | stable |
| `clap_complete` dynamic completions (`CompleteEnv`, `ArgValueCandidates`) | behind the `unstable-dynamic` feature |

That last row matters more for lumis than for most tools: `--theme <TAB>` over
246 themes and `-l <TAB>` over 100+ languages is a real win, and it is currently
only reachable on an unstable feature.

### Subcommand-per-formatter, tested and rejected

Before settling, I built it: `lumis highlight html-inline main.rs --pre-class code`.
It maps 1:1 onto the Rust builders, which is the best parity story on paper.

| Input | Result |
| --- | --- |
| `highlight main.rs html-inline --pre-class code` | parses, but the file comes **before** the format, backwards from how it reads today |
| `highlight html-inline main.rs --pre-class code` | `error: unexpected argument 'main.rs' found`. The order a user would actually type is rejected |
| `highlight terminal` | parses as the **subcommand**, silently. A file named `terminal` is unreachable without `./terminal` |
| `path` on both parent and subcommand | both slots fill; one is silently dropped |

The filename/subcommand collision trades one silent-wrong-answer bug for another.
This is also the case where the "groups" instinct misfires: gh and mise group
*commands*, and the thing being grouped here is a *mode*.

## Prior art in this exact domain

| Tool | Approach | Verdict |
| --- | --- | --- |
| [chroma](https://github.com/alecthomas/chroma/blob/master/cmd/chroma/main.go) | Prefix-namespaces every backend flag (`--html-prefix`, `--html-tab-width`, `--html-lines-table`, 14 of them) **and** tags each `group:"html"` so kong prints one heading | The closest analogue. Note it does both, not one or the other |
| [pygments](https://pygments.org/docs/cmdline/) | Untyped option bag `-O style=colorful,linenos=1`, plus `-P` for values with commas, plus `-H <type> <name>` for per-formatter help | Measured below. The bag is the problem, `-H` is the mitigation |
| [shiki CLI](https://shiki.style/packages/cli) | Three flags total | Dodges the question by having almost no options |

Measured pygments (2.20.0, via `uvx`):

```
$ pygmentize -f terminal -O totallybogus=1 -l python t.py   # unknown option
x = 1                                                        # exit 0, no warning
$ pygmentize -f html -O linenos=banana -l python t.py        # invalid value
<div class="highlight"><table class="highlighttable">...     # exit 0, silently became linenos=table
```

An option bag has nothing to validate against, and nothing for `--help` or shell
completion to describe. That rules out `-O k=v` and its variants
(`--formatter html-inline:pre_class=x`, `--set html.pre_class=x`).

Adjacent domains, briefly:

- **ffmpeg** — `-h encoder=libx264` prints exactly what that encoder accepts.
  Grouped general help. The contextual-help idea is good, ffmpeg is otherwise the
  cautionary tale.
- **ImageMagick** — `-define png:compression-level=9`. Namespaced bag, same hole.
- **docker buildx** — `--output type=local,dest=out`. A second parser inside a
  string, no completion.
- **gh** — `cannot use --jq without specifying --json`. One sentence, no usage
  dump. This is the error-message model to copy.

## What developers complain about

X/Twitter was not reachable from this environment. `x.com` returns HTTP 402 to
the fetcher, the xcancel mirror serves a CAPTCHA, and nitter returned nothing.
The sources below are the indexable ones. If a specific X thread matters, paste
the link.

- Julia Evans' [survey of what people find confusing about the command
  line](https://social.jvns.ca/@b0rk/112712799836837523) puts **bad
  discoverability** and **"differences in command line flag syntax between
  different programs"** near the top. Do not invent syntax; make `--help` answer
  the question.
- [clig.dev](https://clig.dev/) — *"Use standard names for flags, if there is a
  standard"*, listing `-h, --help`. Also *"Lead with examples."*
- [rustc's CLI guidelines](https://rustc-dev-guide.rust-lang.org/cli.html) —
  *"Flags should be orthogonal to each other. For example, if we'd have a
  json-emitting variant of multiple actions `foo` and `bar`, an additional
  `--json` flag is better than adding `--foo-json` and `--bar-json`."* A direct
  argument against prefixing anything shared by more than one formatter.
- [python-rsrcfork#4](https://github.com/dgelessus/python-rsrcfork/issues/4) is
  this exact bug filed elsewhere: *"Some options only apply to one of the two
  modes, and setting them in the other mode does nothing"*, resolved as
  "incompatible options should cause errors."
- Silently swallowing flags gets filed as a bug wherever it appears:
  [serverless#2282](https://github.com/serverless/serverless/issues/2282),
  [changesets#1827](https://github.com/changesets/changesets/issues/1827).

I found nothing arguing for silence. Where tools disagree it is error vs warning,
never error vs ignore.

## Recommendation

Keep the command grouping exactly as it is. Restructure the *options* inside
`lumis highlight` the way uv does, validate them the way mise's usage spec has to,
and generate the applicability table the way mise generates settings.

### 1. Factor the options into flattened `Args` structs, one per scope

```rust
#[derive(Args)]
struct HighlightArgs {
    path: Option<String>,
    #[arg(short = 'l', long)] language: Option<String>,
    #[arg(short = 'f', long, default_value = "terminal")] formatter: Formatter,
    #[arg(short = 't', long)] theme: Option<String>,
    #[arg(long)] rainbow_brackets: bool,

    #[command(flatten)] terminal: TerminalArgs,
    #[command(flatten)] html: HtmlArgs,
    #[command(flatten)] styled: StyledHtmlArgs,
    #[command(flatten)] multi: MultiThemeArgs,
}

#[derive(Args)]
#[command(next_help_heading = OPTSET_TERMINAL)]
struct TerminalArgs { /* background, width */ }
```

The struct boundary becomes the applicability boundary, and it also becomes the
call boundary: `render_output` currently destructures a dozen fields out of one
flat struct, and would instead hand `a.html` and `a.styled` to the builder as
units. Headings as `const OPTSET_*`, mise-style.

Prototyped help output:

```
Options:
  -l, --language <LANGUAGE>    Language id (e.g. rust, javascript, elixir)
  -f, --formatter <FORMATTER>  Output format [default: terminal] [possible values: ...]
  -t, --theme <THEME>          Theme name, e.g. dracula, github_dark, or auto
      --rainbow-brackets       Render nested brackets using rainbow bracket scopes
  -h, --help                   Print help

Terminal options (--formatter terminal):
  -b, --background <BACKGROUND>  Fallback background: `theme`, a hex color, or omit to inherit
  -w, --width <WIDTH>            Render width for background padding: a number or `auto`

HTML options (--formatter html-inline, html-linked, html-multi-themes):
      --pre-class <PRE_CLASS>              CSS class appended to the wrapping <pre> tag
      --header-open <HEADER_OPEN>          Opening tag wrapped around the output
      --header-close <HEADER_CLOSE>        Closing tag wrapped around the output
  -H, --highlight-lines <LINES>            Lines to highlight, e.g. "1,3-5,10"
      --highlight-lines-class <CLASS>      CSS class added to highlighted lines

Inline-style options (--formatter html-inline, html-multi-themes):
      --italic                         Apply italic styles from the theme
      --include-highlights             Add data-highlight attributes naming each scope
      --highlight-lines-style <STYLE>  `theme`, `none`, or raw CSS [default: theme]

Multi-theme options (--formatter html-multi-themes):
      --themes <THEMES>                Theme pair as name:theme_id, repeatable
      --default-theme <DEFAULT_THEME>  Which --themes entry gets inline styles
      --css-variable-prefix <PREFIX>   Prefix for CSS custom properties [default: --lumis]
```

Naming the formatters in the heading is what makes this work. Nothing is renamed,
no flag needs its own annotation, and the overlapping scopes are expressible
because a heading is only a string.

### 2. Validate per group, not per flag

One check per struct, so a wrong invocation reports every offending flag at once
instead of one per run. Prototyped:

```
$ lumis highlight main.rs -f bbcode-scoped --italic --include-highlights
error: `--italic`, `--include-highlights` are not accepted by the `bbcode-scoped` formatter

  inline-style options apply to: html-inline, html-multi-themes
  run `lumis formatters show bbcode-scoped` to see what it accepts
```

```
$ lumis highlight main.rs -f html-inline -w 120 -b theme
error: `--background`, `--width` are not accepted by the `html-inline` formatter

  terminal options apply to: terminal
  run `lumis formatters show html-inline` to see what it accepts
```

Both are real prototype output. Message shape follows gh: state the problem in
one line, then how to fix it.

### 3. Generate the table from the manifest

`fixtures/formatter-options.json` already holds the applicability data. The
group-to-formatter mapping should be generated from it at build time, following
mise's `settings.toml`. A hand-written copy beside the manifest is a second copy
of the same data, which `AGENTS.md` forbids, and it will drift the first time an
option is added.

The generation should also emit the docs table in
`docs/content/cli/commands.mdx`, which is currently hand-maintained and already
lists all 17 flags in one undifferentiated block.

This design keeps the existing parity check working untouched:
`crates/lumis-cli/tests/formatter_options.rs` reads `lumis highlight --help` and
looks for `--<kebab-name>`, and neither `help_heading` nor `flatten` changes the
flag tokens. A prefix rename would instead need a `spelling.cli` entry per flag,
turning the shared-API manifest into a carrier of CLI trivia.

### 4. Then the two things that follow from it

- **Formatter-scoped config tables.** `[highlight.html_inline] pre_class = "…"`
  next to today's `[highlight] theme = "…"`. `config.rs` holds exactly one key
  today, so this is the moment to shape it. mise's answer to option sprawl was
  171 settings in a config layer, not 171 flags.
- **`clap_complete`.** Not a dependency today. Static completions are stable and
  worth shipping now; dynamic value completion for `--theme` and `-l` is behind
  `unstable-dynamic`, so treat it as a separate decision.

Steps 1 to 3 are the fix. 4 is follow-on work that can ship separately.

## Examples

Real transcripts from the prototype, not mockups.

### Valid invocations, unchanged from today

```
$ lumis highlight main.rs
$ lumis highlight main.rs -f terminal -t dracula -b theme -w 120
$ lumis highlight main.rs -f html-inline -t github_dark --pre-class code --italic -H 1,3-5
$ lumis highlight main.rs -f html-linked --pre-class code -H 2 --highlight-lines-class hl
$ lumis highlight main.rs -f bbcode-scoped --rainbow-brackets
```

### The 42 dead cells become errors

One flag wrong:

```
$ lumis highlight main.rs --pre-class code
error: `--pre-class` is not accepted by the `terminal` formatter

  HTML options apply to: html-inline, html-linked, html-multi-themes
  run `lumis formatters show terminal` to see what it accepts
[exit 2]
```

Several wrong at once, reported together rather than one per run. This is what
group-level validation buys over per-flag:

```
$ lumis highlight main.rs -f html-inline -w 120 -b theme
error: `--background`, `--width` are not accepted by the `html-inline` formatter

  terminal options apply to: terminal
  run `lumis formatters show html-inline` to see what it accepts
[exit 2]
```

S4, which today renders uncolored HTML and exits 0:

```
$ lumis highlight main.rs -f html-linked -t dracula
error: `--theme` is not accepted by the `html-linked` formatter

  `--theme` applies to: html-inline, terminal
  run `lumis formatters show html-linked` to see what it accepts
[exit 2]
```

The case no prefix scheme catches, since `--highlight-lines-style` is HTML-only
*and* not html-linked:

```
$ lumis highlight main.rs -f html-linked --highlight-lines-style none -H 1
error: `--highlight-lines-style` is not accepted by the `html-linked` formatter

  inline-style options apply to: html-inline, html-multi-themes
[exit 2]
```

What clap already handles through `requires`, unchanged from #1266:

```
$ lumis highlight main.rs -f html-inline --header-open '<figure>'
error: the following required arguments were not provided:
  --header-close <HEADER_CLOSE>
```

### `lumis formatters`

```
$ lumis formatters list
html-inline        HTML with inline style attributes
html-multi-themes  HTML with CSS custom properties, one set per theme
html-linked        HTML with CSS class names (pair with a theme stylesheet)
terminal           ANSI escape codes (default)
bbcode-scoped      BBCode using highlight scope names as tags

$ lumis formatters show terminal
terminal accepts:

  --language
  --rainbow-brackets
  --theme
  --background
  --width

run `lumis highlight --help` for descriptions
```

Both read the same generated table the validation reads, so they cannot disagree
with each other or with `--help`.

### One wording trap

The singular/plural branch in the error has to agree with its subject. The count
of offending flags and the group label are different things: `--theme` is a
one-flag group, so keying the verb off the flag count produces
"`--theme` **apply** to". Key it off the label.

## Secondary findings

Found while reading the CLI; not caused by #1266. All but S5 shipped in #1267.

| # | Finding | Status |
| --- | --- | --- |
| S1 | **`-h` is `--highlight-lines`, not `--help`.** `disable_help_flag = true` and `--help` is long-only. Verified in the prototype: `lumis highlight -h` prints `error: a value is required for '--highlight-lines <HIGHLIGHT_LINES>' but none was supplied` and exits 2. clig.dev lists `-h, --help` in its standard-names table. Move highlight-lines to `-H` or drop its short | fixed |
| S2 | **`-v` and `-V` are inverted.** `-v` is version and `-V` is verbose, the opposite of clap's own default (`-V` = version) and of the GNU convention (`-v` = verbose) | fixed |
| S3 | **`--css-variable-prefix` has `default_value = "--lumis"`,** so it is always "present". Make it `Option<String>` with the default applied at the call site, or group validation will fire on an argument nobody passed | fixed |
| S4 | **`--theme` on `html-linked` is the most misleading no-op of the 42.** Someone running `-f html-linked -t dracula` wants colors and gets bare class names with no indication why | fixed |
| S5 | **No shell completions.** `clap_complete` is not a dependency | open |
| S6 | The `after_help` examples on `highlight` are good and clig.dev-aligned; they predate six of the flags. mise puts a long `Examples:` block at the end of every command's help. Refresh, and consider extending the habit to the other commands | fixed |
| S7 | **`--css-variable-prefix` cannot take its own default value in space-separated form.** Found while running examples through the prototype: `--css-variable-prefix --shiki` fails with `error: unexpected argument '--shiki' found`, because clap reads a leading `--` as the next flag. Only `--css-variable-prefix=--shiki` works, and the documented default is literally `--lumis`. Needs `allow_hyphen_values = true`, and the docs example should use `=` either way | fixed |

## Open questions

1. **Error or warn on an inapplicable flag?** Recommending error: it is what
   rsrcfork#4 concluded, what gh does, and a warning on stderr is invisible in
   the pipelines this CLI lives in. The cost is that any existing script passing
   a dead flag breaks. That is a CLI-only break; no library API moves.
2. **Is `lumis formatters list` / `formatters show <name>` the right home,** or
   should it be `lumis highlight --help-formatter <name>`? A sibling of
   `languages list` and `themes list` fits the grouping you already have, and
   `formatters list` is missing from the CLI today regardless.
3. **Where does `--theme` sit?** It belongs to html-inline and terminal, so
   strictly it goes under a heading. But it is step 2 of the documented four-step
   model and burying it hurts the common case. Leaning: keep it in the main
   block, still error when the formatter cannot use it.
4. **Is the applicability data richer than the manifest?** `formatter-options.json`
   says which formatter accepts which option. It does not say which *group* an
   option belongs to, and the groups are what the headings and the validation
   need. Either derive the groups from the acceptance sets (they fall out
   uniquely today) or add an explicit `group` key. Deriving is less to maintain
   but breaks the day two groups have identical acceptance sets.

## Reproducing

- CLI source at the merge commit: `gh api "repos/leandrocp/lumis/contents/crates/lumis-cli/src/main.rs?ref=6172edeac33c824cb56dee3793a4fd619ab66ff8" -q '.content' | base64 -d`
- mise: `git clone --depth 1 --filter=blob:none --sparse https://github.com/jdx/mise.git`, then `git sparse-checkout set src/cli`. Settings schema is `settings.toml` at the root.
- uv: same, `git sparse-checkout set crates/uv-cli`.
- pygments: `uvx --from pygments pygmentize -f terminal -O totallybogus=1 -l python <file>`
- clap experiments: `/tmp/clapproto`, a standalone crate on clap 4.6.4, one file.
  Not committed; the results are transcribed above.
- Nothing in this worktree is modified except this file.
