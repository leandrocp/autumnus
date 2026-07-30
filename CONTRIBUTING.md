# Contributing

See `ARCHITECTURE.md` for how the crates, packages, website, and build pipeline fit together.

## Table of contents

- [Getting started](#getting-started)
- [Testing](#testing)
- [Releases](#releases)
- [Benchmarks](#benchmarks)
- [Configuration files](#configuration-files)
  - [highlights.toml](#highlightstoml)
  - [languages.toml](#languagestoml)
- [Languages and parsers](#languages-and-parsers)
  - [Adding a new language](#adding-a-new-language)
  - [Updating parsers](#updating-parsers)
  - [Updating queries](#updating-queries)
  - [Building WASMs](#building-wasms)
- [Themes](#themes)
  - [Adding a new theme](#adding-a-new-theme)
  - [Updating themes](#updating-themes)

## Getting started

This project uses [mise](https://mise.jdx.dev/) as its task runner. The root configuration intentionally does not pin tool versions; tasks use the Rust, JavaScript, Elixir, and other toolchains already available in your environment. After cloning the repo, run:

```sh
mise run setup
```

This installs the Rust, JS, and Elixir dependencies and checks the required tools.

## Testing

Run the standard Rust, Elixir, and JavaScript test suites with:

```sh
mise run test
```

Cross-runtime output compatibility and browser support have dedicated suites:

```sh
mise run test-conformance
mise run test-conformance-browser
```

`test-conformance` includes the browser suite. Run an individual conformance task to check one runtime in isolation:

```sh
mise run test-conformance-rust
mise run test-conformance-cli
mise run test-conformance-javascript-wasm
mise run test-conformance-browser
mise run test-conformance-elixir
```

The browser task installs the required Chromium, Firefox, and WebKit builds before running. CI runs these five tasks as independent parallel jobs.

## Releases

Releases are prepared locally and published from tags.

- Run `mise run release-needed` to list packages with non-chore path-scoped commits since their latest package tag.
- Prepare each release with `mise run release-prepare <package> <version>`.
- `mise run release-prepare` updates only the target package version file and prepends the next changelog entry.
- If dependent manifests must move together, update them separately in the same release commit.
- Maintainers commit the release prep changes, then push package tags such as `cargo-lumis-cli/v0.2.0`.
- Pushing a package tag triggers the publish workflows.

Do not hand-edit release versions or changelog sections when `mise run release-prepare` can generate them.

## Benchmarks

The suite under [`benchmarks/`](benchmarks/) runs four shared scenarios across Lumis Rust, Elixir, JavaScript Wasm, and CLI, plus syntect, Shiki, and `bat`. It uses Criterion for Rust and syntect, Mitata for JavaScript and Shiki, Benchee for Elixir, and Hyperfine for the CLIs. It also measures comparable package and release artifact sizes. mise installs the pinned toolchain and coordinates the runs.

Run the complete suite with:

```sh
mise trust benchmarks/mise.toml
mise install -C benchmarks
mise run -C benchmarks run
```

The root `mise run bench` task runs the same suite. Scenarios and current results are listed in [`benchmarks/README.md`](benchmarks/README.md).

## Configuration files

These files drive code generation, builds, detection metadata, and theme extraction.

| File | Purpose |
| ------ | --------- |
| [`highlights.toml`](highlights.toml) | Tree-sitter highlight scope names |
| [`languages.toml`](languages.toml) | Parser metadata, query sources, language bundles, feature flags |
| [`themes/themes.lua`](themes/themes.lua) | Theme definitions from Neovim colorscheme sources |

### highlights.toml

`highlights.toml` defines the recognized Tree-sitter highlight scope names. `crates/lumis-core/src/highlights.rs` and `packages/javascript/lumis/src/highlights.ts` are generated from it, so do not edit those files by hand.

After changing `highlights.toml`, regenerate:

```sh
mise run langs-gen-highlights
```

This updates:

- `highlights.rs`: `HIGHLIGHT_NAMES` and `CLASSES` arrays (`CLASSES` replaces `.` with `-`)
- `highlights.ts`: `HIGHLIGHT_NAMES` array

### languages.toml

All language metadata lives in `languages.toml`. It is consumed by:

- `crates/dev`: fetches vendored parsers, preprocesses queries, builds WASMs, and generates the Rust package catalog and docs
- `crates/lumis/build.rs`: reads `queries/processed/` to embed query constants, including Lua-to-Rust regex conversion
- `crates/lumis-cli/build.rs`: reads `queries/processed/` to embed query constants
- `crates/lumis-core/build.rs`: generates the `Language` enum and Rust detection metadata
- `packages/javascript/lumis/scripts/build-langs.ts`: generates `packages/javascript/lumis/langs/*.ts`, bundles, and JS detection and loader metadata
- `packages/javascript/scripts/build-wasm-bundles.ts`: generates `packages/javascript/wasm-bundle-*` preset packages from bundle definitions
- CI workflows: build WASMs and update parser and query revisions

Bundle definitions also live here under `[bundles.*]`.

For Rust crates, bundle support is implemented as Cargo features such as `lang-bundle-web` and `lang-bundle-system`, which enable the related `lang-*` features transitively. The `lang-bundle-*` feature lists in `crates/lumis/Cargo.toml` and `crates/lumis-core/Cargo.toml` are generated from `languages.toml` by `mise run cargo-update-features`.

- Keep one parser ID per line in bundle arrays for cleaner diffs.
- After changing parser or bundle entries, sync the generated Rust and JavaScript outputs:

```sh
mise run cargo-update-features
mise run langs-gen-catalog
pnpm --filter @lumis-sh/lumis build:generate
pnpm --dir packages/javascript run build:wasm-bundles
```

This updates files such as:

- `crates/lumis-wasm-runtime/src/catalog.rs`
- `packages/javascript/lumis/langs/*.ts`
- `packages/javascript/lumis/bundles/*.ts`
- `packages/javascript/lumis/src/generated/*`
- `packages/javascript/wasm-bundle-*/`

Automated parser upgrades regenerate the Rust catalog. CI also runs
`mise run langs-check-catalog` and rejects stale data.

#### Parser entry fields

```toml
[parsers.bash]
git = "https://github.com/tree-sitter/tree-sitter-bash.git"
rev = "a06c2e4415e9bc0346c6b86d401879ffb44058f7"
crate = "tree-sitter-bash"        # optional -- Rust crate name on crates.io
version = "0.25.1"                # required -- crate version (if crate) and WASM release version
location = "bash"                 # optional -- subdirectory in multi-grammar repos
generate = true                   # optional -- run `tree-sitter generate` before build
aliases = ["sh", "zsh"]           # optional -- alternative names (extra from_str matches)
wasm_name = "tree-sitter-bash"    # optional -- override WASM filename (default: tree-sitter-{name})
query_name = "bash"               # optional -- override query directory name (default: parser name)
# Language detection fields (used by lumis-core/build.rs):
globs = ["*.sh", "*.bash"]        # optional -- file glob patterns (default: [])
variant = "Bash"                  # optional -- Rust enum variant (default: titlecase of key)
display_name = "Bash"             # optional -- human-readable name (default: same as variant)
emacs = ["sh"]                    # optional -- Emacs mode names for detection
shebang = ["bash", "sh"]          # optional -- shebang interpreter names
feature = "lang-ocaml"            # optional -- override feature name (default: lang-{key with _ -> -})
```

`git`, `rev`, and `version` are always required. Every parser is identified by its git repo and pinned commit.

`git` + `rev` and `crate` are not alternatives:

- `git` + `rev`: always required for WASM builds, vendored parser fetches, and the source-of-truth version pin
- `crate`: optional and Rust-only. When present, Rust uses the crates.io package instead of vendored source. The dependency must also be declared in `crates/lumis/Cargo.toml` as an optional dependency for new languages, and existing entries are kept in sync from `languages.toml` by `cargo run --manifest-path crates/dev/Cargo.toml --no-default-features -- cargo-update-dep`.

`version` is used for two things:

1. If `crate` is set, it is the crate version synced into `crates/lumis/Cargo.toml`.
2. It always drives the npm package version for `@lumis-sh/wasm-{name}`.

#### Vendoring unreleased parser fixes

Lumis can deliberately vendor a grammar that also has a crates.io package when
an unreleased source fix is required. Its C sources are then compiled by
`crates/lumis/build.rs`, including Lumis's compiler flags, instead of by the
external crate's build script.

Forks inherit upstream tags, so the newest release tag can point behind the
recorded fork revision. `upgrade-parsers` checks Git ancestry and never replaces
the recorded revision with one of its ancestors. This protects unreleased fork
fixes without separate configuration while still allowing a later descendant
release to advance normally. When the fix ships in an upstream crate release,
return the parser entry to the upstream repository and crate.

#### Query entry fields

```toml
[queries.default]
git = "https://github.com/nvim-treesitter/nvim-treesitter.git"
rev = "3edb01f912867603c2aef9079f208f0244c0885b"
path = "runtime/queries"
```

Most languages use the `default` query source from `nvim-treesitter`. Add an explicit entry only when queries come from a different repo:

```toml
[queries.iex]
git = "https://github.com/elixir-lang/tree-sitter-iex.git"
rev = "39f20bb51f502e32058684e893c0c0b00bb2332c"
path = "queries"
```

## Languages and parsers

### Adding a new language

#### 1. Add a parser entry to `languages.toml`

```toml
[parsers.{name}]
git = "https://github.com/.../tree-sitter-{lang}.git"
rev = "full_commit_sha"
version = "x.y.z"
# Add crate if a crates.io package exists
# Add aliases if the language has common alternative names
```

`crates/lumis-core/build.rs` generates the `Language` enum variant and Rust detection metadata from this entry. The JS build generates its detection tables from the same `languages.toml` data.

#### 2. Add Rust wiring

In `crates/lumis/Cargo.toml`:

- If a crates.io package exists, add an optional dependency:

  ```toml
  tree-sitter-{lang} = { version = "x.y.z", optional = true }
  ```

  and a feature flag:

  ```toml
  lang-{name} = ["dep:tree-sitter-{lang}", "lumis-core/lang-{name}"]
  ```

- If no crate exists, add an empty feature flag:

  ```toml
  lang-{name} = ["lumis-core/lang-{name}"]
  ```

- Add `lang-{name}` to `all-languages` in both `crates/lumis/Cargo.toml` and `crates/lumis-core/Cargo.toml`.
- If the language belongs in an existing bundle, add it to the matching bundle in `languages.toml`, then run `mise run cargo-update-features` to regenerate the `lang-bundle-*` feature lists in both Cargo manifests.

#### 3. Fetch parser and queries

```sh
mise run langs-fetch-vendored-parsers {name}
mise run cargo-update-dep {name}
mise run cargo-update-features
mise run langs-gen-catalog
mise run langs-fetch-queries {name}
```

#### 4. Wire up vendored parsers

Do this when there is no crates.io package or when Lumis intentionally vendors
an unreleased source fix as described in
[Vendoring unreleased parser fixes](#vendoring-unreleased-parser-fixes):

- Add compilation in `crates/lumis/build.rs` inside `vendored_parsers()`.
- Add an `unsafe extern "C"` declaration in `crates/lumis/src/languages.rs`:

  ```rust
  #[cfg(feature = "lang-{name}")]
  fn tree_sitter_{name}() -> *const ();
  ```

#### 5. Wire up highlight config

In `crates/lumis/src/languages.rs`:

- Add a `{LANG}_CONFIG` static `LazyLock<HighlightConfiguration>`.
- Return it from the `config()` match with `#[cfg(feature = "lang-{name}")]`.

#### 6. Add a sample file

Add `samples/{name}.{ext}` with representative code. It is used by tests and `website/` demos.

#### 7. Generate docs

```sh
mise run docs-gen-languages-md
```

This updates `LANGUAGES.md`.

#### 8. Verify

```sh
cargo test --all-features
cargo clippy --all-features -- -D warnings
mise run test-conformance
```

### Updating parsers

```sh
mise run langs-upgrade-parsers {name}
mise run langs-fetch-vendored-parsers {name}
```

For parser and query upgrades, prefer the `Upgrade Languages` GitHub workflow or run the upgrade recipes below before `mise run langs-update {name}`. Do not use Dependabot to bump `tree-sitter-*` Rust parser crates independently. Those versions are tied to the pinned parser and query state in `languages.toml`.

`mise run langs-upgrade-parsers {name}` updates `languages.toml`, syncs any crate-backed Rust parser versions into `crates/lumis/Cargo.toml`, and refreshes Rust bundle features from `languages.toml`.

### Updating queries

```sh
mise run langs-upgrade-queries {name}
mise run langs-fetch-queries {name}
mise run langs-preprocess-queries
```

Omit `{name}` to upgrade all queries at once.

`mise run langs-update {name}` is the end-to-end command for a coordinated parser update. It fetches parsers first, syncs crate-backed Rust parser dependencies and Rust bundle features, then fetches and preprocesses queries, and regenerates `LANGUAGES.md`.

Raw query sources live in `queries/upstream/`. First-class local bracket queries live in `queries/brackets/`. Preprocessed tracked outputs live in `queries/processed/` and should be committed whenever upstream queries, bracket queries, replacements, or append patches change.

#### Bracket queries

Upstream grammars and nvim-treesitter rarely ship a `brackets.scm`, so Lumis keeps its own as first-class local queries:

- `queries/brackets/default/brackets.scm`: shared default, used by any language without its own bracket query
- `queries/brackets/{name}/brackets.scm`: a language-specific query for when the default doesn't fit the grammar

Bracket matching and rainbow brackets both read these queries. A query captures `@open`/`@close` pairs; a pattern tagged with `(#set! rainbow.exclude)` still matches but is skipped during rainbow coloring, so string and template delimiters stay uncolored.

#### Query replacements and append patches

When a fetched upstream query needs to change, use one of these directories:

- `queries/override/{name}/{query}.scm`: replace the upstream query entirely when it's incompatible with the pinned parser
- `queries/append/{name}/{query}.scm`: add local patterns after the upstream query, or after the replacement query when both exist

### Building WASMs

WASMs are built in CI by the `wasm-release` workflow, but you can build them locally with emscripten:

```sh
mise run wasm-build
mise run wasm-build {name}
```

This requires `emcc` and `tree-sitter-cli`.

#### WASM distribution

Each grammar is published as a self-contained `@lumis-sh/wasm-{name}` language
package. It contains the parser WASM, matching processed queries, aliases,
grammar metadata, byte length, and SHA-256. During staging, `crates/dev`
generates `tmp/wasm-publish/{name}/language.json`; it is published with the
package rather than checked in.

Runtime catalogs generated from `languages.toml` contain only stable IDs,
aliases, and package names. JavaScript, CLI, and Elixir resolve the current
`language.json`, cache it, then fetch the exact versioned parser named by that
metadata and verify its bytes. Parser or query updates therefore publish only
the affected language package, without a runtime release.

CLI and Node caches persist on disk, browsers use CacheStorage with an IndexedDB
fallback, and Elixir can embed selected package metadata and parsers under
release-local `priv/wasm`. Local and benchmark execution should provide both
`language.json` and its matching parser so queries and parser bytes remain
atomic.

The `wasm-release` workflow publishes packages automatically. It detects which parsers still need publishing with `scripts/wasm-needed.py` and builds and publishes them in parallel.

## Themes

Themes are extracted from Neovim colorscheme plugins. Each theme is a JSON file in `themes/`. Theme definitions live in [`themes/themes.lua`](themes/themes.lua), which follows the `vim.pack` convention so Neovim can install them automatically.

### Adding a new theme

1. Add the theme definition to `themes/themes.lua`:

```lua
{
    url = "https://github.com/author/theme-repo",
    name = "theme_name",
    config = function()
        vim.o.background = "dark"
        vim.cmd([[colorscheme theme-name]])
    end,
}
```

1. Generate the JSON file and sync package outputs:

```sh
mise run themes-gen theme_name
```

1. Regenerate CSS and sync package outputs:

```sh
mise run css-gen
```

1. Regenerate docs:

```sh
mise run docs-gen-themes-md
```

`build.rs` picks it up on the next build.

### Updating themes

```sh
mise run themes-gen
mise run themes-gen theme_name
```

After regenerating, refresh CSS outputs:

```sh
mise run css-gen
```

Theme generation keeps the previous revision when an upstream commit produces
identical theme data, so revision-only changes do not create update PRs.
