# Contributing Languages and Queries

## Adding a New Language

### 1. Parser

Choose one approach:

**A) Crate from crates.io** (preferred when available)

- Add optional dependency in `crates/lumis/Cargo.toml`:
  ```toml
  tree-sitter-{lang} = { version = "x.y.z", optional = true }
  ```
- Add feature flag:
  ```toml
  lang-{name} = ["dep:tree-sitter-{lang}"]
  ```
- Add to `all-languages` list
- Add metadata entry under `[package.metadata.langs.parsers]`:
  ```toml
  {name} = { dep = true }
  ```

**B) Vendored parser** (when no crate exists)

- Add metadata entry under `[package.metadata.langs.parsers]`:
  ```toml
  {name} = { git = "https://github.com/…/tree-sitter-{lang}.git", rev = "full_commit_sha" }
  ```
- Add feature flag (no dep needed):
  ```toml
  lang-{name} = []
  ```
- Add to `all-languages` list
- Run `just langs-fetch-parsers {name}` to fetch the parser source into `vendored_parsers/`
- Wire up compilation in `crates/lumis/build.rs` inside the `vendored_parsers()` function
- Add an `unsafe extern "C"` declaration in `languages.rs`
  ```rust
  #[cfg(feature = "lang-{name}")]
  fn tree_sitter_{name}() -> *const ();
  ```

### 2. Query files

Most languages use the `default` query source (nvim-treesitter) defined in `[package.metadata.langs.queries]`. You only need to add an explicit entry if queries come from a different repo:

  ```toml
  # only needed when NOT using nvim-treesitter
  {name} = { git = "https://github.com/…/tree-sitter-{name}.git", rev = "...", path = "queries" }
  ```

The `path` field specifies where `.scm` files live in the repo. For the `default` entry it's a prefix (`runtime/queries`) and the language name is appended automatically. For explicit entries, use the full path to the `.scm` directory (e.g., `queries`, `runtime/queries/wat`).

- Run `just langs-fetch-queries {name}` to fetch `highlights.scm`, `injections.scm`, and `locals.scm` into `crates/lumis/queries/{name}/`

### 3. Fetch and build

After wiring up the parser, queries, and `languages.rs`:

```sh
just langs-fetch-parsers {name}   # only for vendored parsers
just langs-fetch-queries {name}
cargo build --all-features
```

### 4. Wire up `languages.rs`

In `crates/lumis/src/languages.rs`:

- [ ] Add variant to the `Language` enum with `#[cfg(feature = "lang-{name}")]`
- [ ] Add name matching in `Language::guess()` (exact name, aliases)
- [ ] Add file extensions in `from_extension()`
- [ ] Add shebangs in `from_shebang()` if applicable
- [ ] Add the `{LANG}_CONFIG` static `LazyLock` with the `HighlightConfiguration`
- [ ] Return it from the `config()` method with `#[cfg(feature = "lang-{name}")]`

### 5. Sample file

Add a sample file at `samples/{name}.{ext}` with representative code for testing.

### 6. Generate docs

Run `just docs-gen-languages` to update `LANGUAGES.md`.

### 7. Verify

```sh
cargo test --all-features
cargo clippy --all-features -- -D warnings
```

## Updating Parsers

```sh
just langs-upgrade-parsers {name} # updates Cargo.toml
just langs-fetch-parsers {name}   # fetches updated files
```

## Updating Queries

To upgrade query files from upstream:

```sh
just langs-upgrade-queries {name} # updates Cargo.toml
just langs-fetch-queries {name}   # fetches updated files
```

To upgrade all queries at once, omit the name argument.

### Custom overrides

If a query needs modifications that diverge from upstream, place override files in `crates/lumis/overwrites/{name}/`. These are merged on top of the upstream queries during build.
