# Contributing

See `ARCHITECTURE.md` for an overview of how the crates, packages, website, and build pipeline fit together.

## Table of contents

- [Getting started](#getting-started)
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

This project uses [just](https://just.systems/man/en/) as a command runner. After cloning the repo, run:

```sh
just setup
```

This installs all dependencies (Rust, JS, Elixir) and checks that required tools are available.

## Configuration files

These files feed into code generation, builds, detection metadata, and theme extraction.

| File | Purpose |
|------|---------|
| [`highlights.toml`](highlights.toml) | Tree-sitter highlight scope names |
| [`languages.toml`](languages.toml) | Parser metadata, query sources, feature flags |
| [`themes/themes.lua`](themes/themes.lua) | Theme definitions (Neovim colorscheme sources) |

### highlights.toml

Defines the recognized Tree-sitter highlight scope names. Both `crates/lumis-core/src/highlights.rs` and `packages/javascript/lumis/src/highlights.ts` are generated from this file -- do not edit them by hand.

After modifying `highlights.toml`, regenerate:

```sh
just langs-gen-highlights
```

This produces:
- `highlights.rs` -- `HIGHLIGHT_NAMES` and `CLASSES` arrays (classes derived by replacing `.` with `-`)
- `highlights.ts` -- `HIGHLIGHT_NAMES` array

### languages.toml

All language metadata lives here. Consumed by:

- `crates/dev` -- fetches vendored parsers, preprocesses queries, builds WASMs, and generates docs
- `crates/lumis/build.rs` -- reads `queries/processed/` to embed query constants (with Lua-to-Rust regex conversion)
- `crates/lumis-cli/build.rs` -- reads `queries/processed/` to embed query constants
- `crates/lumis-core/build.rs` -- generates the `Language` enum and Rust-side detection metadata
- `packages/javascript/lumis/scripts/build-langs.ts` -- generates `packages/javascript/lumis/langs/*.ts`, bundles, and JS detection/load metadata from the same source
- `packages/javascript/lumis/scripts/build-wasm-bundles.ts` -- generates `packages/javascript/wasm-bundle-*` preset packages from bundle definitions in the same source
- CI workflows -- builds WASMs, updates parser/query revisions

Bundle definitions also live in `languages.toml` under `[bundles.*]`.

- Keep one parser ID per line inside bundle arrays for cleaner diffs.
- After changing parser or bundle entries, regenerate the checked-in JavaScript outputs:

```sh
pnpm --filter @lumis-sh/lumis build:generate
```

This updates files such as:

- `packages/javascript/lumis/langs/*.ts`
- `packages/javascript/lumis/bundles/*.ts`
- `packages/javascript/lumis/src/generated/*`
- `packages/javascript/wasm-bundle-*/`

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

`git`, `rev`, and `version` are always required. Every parser is identified by its git repo and a pinned commit.

`git` + `rev` vs `crate`: these are not alternatives.

- `git` + `rev` -- always required. Used to build WASMs, fetch vendored parser sources, and as the authoritative version pin.
- `crate` -- optional, Rust-only. When present, the Rust build uses the crate from crates.io instead of compiling from vendored source. The dependency must also be declared in `crates/lumis/Cargo.toml` as an optional dep (see step 2 below).

`version` is used for two things:
1. When `crate` is set, this is the crate version in `Cargo.toml`
2. Always drives the npm package version for `@lumis-sh/wasm-{name}`

#### Query entry fields

```toml
[queries.default]
git = "https://github.com/nvim-treesitter/nvim-treesitter.git"
rev = "3edb01f912867603c2aef9079f208f0244c0885b"
path = "runtime/queries"
```

Most languages use the `default` query source (nvim-treesitter). Add an explicit entry only when queries come from a different repo:

```toml
[queries.iex]
git = "https://github.com/elixir-lang/tree-sitter-iex.git"
rev = "39f20bb51f502e32058684e893c0c0b00bb2332c"
path = "queries"
```

## Languages and parsers

### Adding a new language

#### 1. Add parser entry to `languages.toml`

```toml
[parsers.{name}]
git = "https://github.com/…/tree-sitter-{lang}.git"
rev = "full_commit_sha"
version = "x.y.z"
# Add crate if a crates.io package exists
# Add aliases if the language has common alternative names
```

`crates/lumis-core/build.rs` generates the `Language` enum variant and detection metadata (globs, shebangs, etc.) from this entry, and the JS build generates its detection tables from the same `languages.toml` data.

#### 2. Add Rust wiring

In `crates/lumis/Cargo.toml`:

- If a crate exists on crates.io, add an optional dependency:
  ```toml
  tree-sitter-{lang} = { version = "x.y.z", optional = true }
  ```
  and a feature flag:
  ```toml
  lang-{name} = ["dep:tree-sitter-{lang}"]
  ```
- If no crate exists, add an empty feature flag:
  ```toml
  lang-{name} = []
  ```
- Add to the `all-languages` list

#### 3. Fetch parser and queries

```sh
just langs-fetch-parsers {name}   # fetches vendored source from git
just langs-fetch-queries {name}   # fetches .scm query files
```

#### 4. Wire up vendored parsers (only if there is no crates.io package)

If the parser has no crates.io package:

- Add compilation in `crates/lumis/build.rs` inside the `vendored_parsers()` function
- Add an `unsafe extern "C"` declaration in `crates/lumis/src/languages.rs`:
  ```rust
  #[cfg(feature = "lang-{name}")]
  fn tree_sitter_{name}() -> *const ();
  ```

#### 5. Wire up highlight config

In `crates/lumis/src/languages.rs`:

- Add a `{LANG}_CONFIG` static `LazyLock<HighlightConfiguration>`
- Return it from the `config()` match with `#[cfg(feature = "lang-{name}")]`

#### 6. Sample file

Add a sample file at `samples/{name}.{ext}` with representative code. It is used by tests and by `website/` demos.

#### 7. Generate docs

```sh
just docs-gen-languages-md
```

Updates `LANGUAGES.md`.

#### 8. Verify

```sh
cargo test --all-features
cargo clippy --all-features -- -D warnings
just test-conformance
```

### Updating parsers

```sh
just langs-upgrade-parsers {name} # updates languages.toml revisions
just langs-fetch-parsers {name}   # fetches updated files
```

### Updating queries

```sh
just langs-upgrade-queries {name} # updates languages.toml revisions
just langs-fetch-queries {name}   # fetches updated upstream files
just langs-preprocess-queries     # regenerates checked-in processed queries
```

Omit the name argument to upgrade all queries at once.

Raw query sources live in `queries/upstream/`. Preprocessed tracked outputs live in `queries/processed/` and should be committed whenever upstream queries or overrides change.

#### Custom overrides

If a query needs modifications that diverge from upstream, place override files in `queries/overrides/{name}/`. These are merged on top of the upstream queries during preprocessing.

### Building WASMs

WASMs are built in CI via the `wasm-release` workflow, but you can build locally with emscripten:

```sh
just wasm-build          # build all
just wasm-build {name}   # build one
```

Requires `emcc` (emscripten) and `tree-sitter-cli`.

#### WASM distribution

Each grammar WASM is published as an npm package: `@lumis-sh/wasm-{name}`.

The JS package (`@lumis-sh/lumis`) does not bundle parser WASMs. Language bundles contain a `WasmRef` (`packageName`, `name`, `version`) that is resolved at runtime via the WASM resolver. The default resolver fetches from jsDelivr. Call `configureWasmResolver()` to point at your own server.

The CLI (`lumis-cli`) also fetches parser WASMs from unpkg on first use and caches them in the data directory.

The `wasm-release` workflow publishes packages automatically. It detects which parsers need publishing (via `scripts/wasm-needed.py`) and builds/publishes them in parallel.

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

2. Generate the JSON file:

```sh
just themes-gen theme_name
```

3. Sync themes and regenerate CSS:

```sh
just themes-sync
just css-gen
just css-sync
```

4. Regenerate docs:

```sh
just docs-gen-themes-md
```

`build.rs` picks it up on the next build.

### Updating themes

```sh
just themes-gen               # regenerate all themes from themes.lua
just themes-gen theme_name    # regenerate a single theme
```

After regenerating, sync the JSON and CSS files:

```sh
just themes-sync
just css-gen
just css-sync
```
