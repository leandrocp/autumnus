# Contributing

See `ARCHITECTURE.md` for how the crates, packages, website, and build pipeline fit together.

## Table of contents

- [Getting started](#getting-started)
- [Releases](#releases)
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

This project uses [just](https://just.systems/man/en/) as its command runner. After cloning the repo, run:

```sh
just setup
```

This installs the Rust, JS, and Elixir dependencies and checks the required tools.

## Releases

Releases are prepared locally and published from tags.

- Run `just release-needed` to list packages with path-scoped commits since their latest package tag.
- Prepare each release with `just release-prepare <package> <version>`.
- `just release-prepare` updates only the target package version file and prepends the next changelog entry.
- If dependent manifests must move together, update them separately in the same release commit.
- Maintainers commit the release prep changes, then push package tags such as `cargo-lumis-cli/v0.2.0`.
- Pushing a package tag triggers the publish workflows.

Do not hand-edit release versions or changelog sections when `just release-prepare` can generate them.

## Configuration files

These files drive code generation, builds, detection metadata, and theme extraction.

| File | Purpose |
|------|---------|
| [`highlights.toml`](highlights.toml) | Tree-sitter highlight scope names |
| [`languages.toml`](languages.toml) | Parser metadata, query sources, language bundles, feature flags |
| [`themes/themes.lua`](themes/themes.lua) | Theme definitions from Neovim colorscheme sources |

### highlights.toml

`highlights.toml` defines the recognized Tree-sitter highlight scope names. `crates/lumis-core/src/highlights.rs` and `packages/javascript/lumis/src/highlights.ts` are generated from it, so do not edit those files by hand.

After changing `highlights.toml`, regenerate:

```sh
just langs-gen-highlights
```

This updates:

- `highlights.rs`: `HIGHLIGHT_NAMES` and `CLASSES` arrays (`CLASSES` replaces `.` with `-`)
- `highlights.ts`: `HIGHLIGHT_NAMES` array

### languages.toml

All language metadata lives in `languages.toml`. It is consumed by:

- `crates/dev`: fetches vendored parsers, preprocesses queries, builds WASMs, and generates docs
- `crates/lumis/build.rs`: reads `queries/processed/` to embed query constants, including Lua-to-Rust regex conversion
- `crates/lumis-cli/build.rs`: reads `queries/processed/` to embed query constants
- `crates/lumis-core/build.rs`: generates the `Language` enum and Rust detection metadata
- `packages/javascript/lumis/scripts/build-langs.ts`: generates `packages/javascript/lumis/langs/*.ts`, bundles, and JS detection and loader metadata
- `packages/javascript/scripts/build-wasm-bundles.ts`: generates `packages/javascript/wasm-bundle-*` preset packages from bundle definitions
- CI workflows: build WASMs and update parser and query revisions

Bundle definitions also live here under `[bundles.*]`.

For Rust crates, bundle support is implemented as Cargo features such as `lang-bundle-web` and `lang-bundle-system`, which enable the related `lang-*` features transitively. The `lang-bundle-*` feature lists in `crates/lumis/Cargo.toml` and `crates/lumis-core/Cargo.toml` are generated from `languages.toml` by `just cargo-update-features`.

- Keep one parser ID per line in bundle arrays for cleaner diffs.
- After changing parser or bundle entries, sync Rust feature manifests and regenerate the checked-in JavaScript outputs:

```sh
just cargo-update-features
pnpm --filter @lumis-sh/lumis build:generate
pnpm --dir packages/javascript run build:wasm-bundles
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

`git`, `rev`, and `version` are always required. Every parser is identified by its git repo and pinned commit.

`git` + `rev` and `crate` are not alternatives:

- `git` + `rev`: always required for WASM builds, vendored parser fetches, and the source-of-truth version pin
- `crate`: optional and Rust-only. When present, Rust uses the crates.io package instead of vendored source. The dependency must also be declared in `crates/lumis/Cargo.toml` as an optional dependency for new languages, and existing entries are kept in sync from `languages.toml` by `cargo run --manifest-path crates/dev/Cargo.toml --no-default-features -- cargo-update-dep`.

`version` is used for two things:

1. If `crate` is set, it is the crate version synced into `crates/lumis/Cargo.toml`.
2. It always drives the npm package version for `@lumis-sh/wasm-{name}`.

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
- If the language belongs in an existing bundle, add it to the matching bundle in `languages.toml`, then run `just cargo-update-features` to regenerate the `lang-bundle-*` feature lists in both Cargo manifests.

#### 3. Fetch parser and queries

```sh
just langs-fetch-vendored-parsers {name}
just cargo-update-dep {name}
just cargo-update-features
just langs-fetch-queries {name}
```

#### 4. Wire up vendored parsers

Do this only if there is no crates.io package:

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
just docs-gen-languages-md
```

This updates `LANGUAGES.md`.

#### 8. Verify

```sh
cargo test --all-features
cargo clippy --all-features -- -D warnings
just test-conformance
```

### Updating parsers

```sh
just langs-upgrade-parsers {name}
just langs-fetch-vendored-parsers {name}
```

For parser and query updates, prefer `just langs-update {name}` or the `update-langs` GitHub workflow. Do not use Dependabot to bump `tree-sitter-*` Rust parser crates independently. Those versions are tied to the pinned parser and query state in `languages.toml`.

`just langs-upgrade-parsers {name}` updates `languages.toml`, syncs any crate-backed Rust parser versions into `crates/lumis/Cargo.toml`, and refreshes Rust bundle features from `languages.toml`.

### Updating queries

```sh
just langs-upgrade-queries {name}
just langs-fetch-queries {name}
just langs-preprocess-queries
```

Omit `{name}` to upgrade all queries at once.

`just langs-update {name}` is the end-to-end command for a coordinated parser update. It fetches parsers first, syncs crate-backed Rust parser dependencies and Rust bundle features, then fetches and preprocesses queries, and regenerates `LANGUAGES.md`.

Raw query sources live in `queries/upstream/`. Preprocessed tracked outputs live in `queries/processed/` and should be committed whenever upstream queries, replacements, or append patches change.

#### Query replacements and append patches

If a query must diverge from upstream, use one of these directories:

- `queries/override/{name}/{query}.scm`: replace the upstream query entirely
- `queries/append/{name}/{query}.scm`: append extra patterns after the upstream query, or after the replacement query when both exist

Use `queries/override/` when the fetched upstream query is incompatible with the pinned parser. Use `queries/append/` when you only need to add local patterns.

### Building WASMs

WASMs are built in CI by the `wasm-release` workflow, but you can build them locally with emscripten:

```sh
just wasm-build
just wasm-build {name}
```

This requires `emcc` and `tree-sitter-cli`.

#### WASM distribution

Each grammar WASM is published as `@lumis-sh/wasm-{name}`.

`@lumis-sh/lumis` does not bundle parser WASMs. Language bundles contain a `WasmRef` (`packageName`, `name`, `version`) that is resolved at runtime by the WASM resolver. The default resolver fetches from jsDelivr. Use `configureWasmResolver()` to point to your own server.

`lumis-cli` also fetches parser WASMs on first use from unpkg and caches them in the data directory.

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
just themes-gen
just themes-gen theme_name
```

After regenerating, sync the JSON and CSS files:

```sh
just themes-sync
just css-gen
just css-sync
```
