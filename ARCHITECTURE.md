# Architecture

<!-- markdownlint-disable MD013 -->

```text
+------------------+ +---------------+ +------------------+
| languages.toml   | | themes/*.json | | queries/**/*.scm |
| parser metadata  | | theme data    | | highlight rules  |
+--------+---------+ +-------+-------+ +---------+--------+
         |                   |                   |
         v                   v                   v
+--------------------------------------------------------------+
| mise.toml + benchmarks/mise.toml + crates/dev                |
| setup / lint / test / docs / codegen / packaging / benchmark |
+-------+-------------------+-------------------+--------------+
        |                   |                   |
        v                   v                   v
+--------------------+ +--------------+ +--------------------+
| processed queries  | | css/*.css    | | tree-sitter-*.wasm |
| generated queries  | | linked HTML  | | parser binaries    |
+---------+----------+ +------+-------+ +----------+---------+
          |                   |                    |
          |                   |                    |
          v                   |                    v
+-------------------------+   |     +---------------------------+
| generated runtime data  |   |     | language packages         |
| JS language handles +   |   |     | parser + queries +        |
| shared Rust catalog     |   |     | integrity metadata        |
+------------+------------+   |     +---------------------------+
+------------+------------+   |                    |
             |                |                    |
             +----------------+--------------------+
                                  |
                                  v
+--------------------------------------------------------------+
| lumis-core (Rust crate)                                      |
| language detection + theme/style logic + formatter behavior  |
+-----------------------------+--------------------------------+
                              |
                              v
+--------------------------+   +--------------------------+   +-------------------------+
| lumis (Rust crate)       |   | lumis-wasm-runtime      |   | javascript/lumis (npm)  |
| native parser features   |   | shared dynamic WASM     |   | web-tree-sitter + WASM  |
+--------------------------+   +------------+-------------+   +------------+------------+
                                               |                              |
                                  +------------+------------+                 |
                                  |                         |                 |
                                  v                         v                 v
                           +--------------+          +----------------+  +----------------+
                           | lumis-cli    |          | elixir/lumis   |  | browser / Node |
                           | Rust binary  |          | Rustler NIF    |  | runtime        |
                           +--------------+          +----------------+  +----------------+
                                  |                         |                 |
                                  +-------------------------+-----------------+
                                                            |
                                                            v
                                                 +---------------------------+
                                                 | website / docs / examples|
                                                 +---------------------------+
```

## Performance benchmark lane

`benchmarks/` is an intentionally non-published comparison layer over the public Rust, JavaScript, and CLI surfaces.

```text
benchmarks/fixtures + deterministic generator
                    |
                    v
       identical small and large Rust inputs
       +----------+----------+----------+
       |          |          |          |
       v          v          v          v
 Rust/Criterion JS/Mitata Elixir/Benchee CLI/Hyperfine
 Lumis/syntect  Lumis/Shiki     Lumis     Lumis/bat
       |          |          |          |
       +----------+----------+----------+
                         |
                         v
 target/benchmarks/runs/current/ raw reports + package sizes + metadata
                         |
                         v
                 benchmarks/README.md
```

The Rust benchmark package is its own Cargo workspace so syntect and Criterion do not enter normal production workspace builds. The private JavaScript benchmark package joins the pnpm workspace so it can consume locally built Lumis packages while keeping Shiki and Mitata out of published manifests.

Fixture generation, optimized artifact builds, timed execution, memory sampling, cache preparation, and reporting are separate mise tasks. `benchmarks/mise.toml` pins the benchmark toolchain, models task dependencies and incremental sources/outputs, and owns shared paths. Root `mise run bench-*` tasks delegate to that benchmark configuration. The root `mise.toml` pins only the Tree-sitter CLI series, which `scripts/wasm-needed.py` reads so the published `lumis.treeSitter` metadata and the CLI that built a parser cannot drift apart; `mise.lock` locks it for every platform CI runs on. Language runtimes stay unpinned at the root so local commands use the developer's own toolchains. Timed families execute serially. Parser assets are prepared and verified before timing so network variability never enters benchmark results.

CI uses `jdx/mise-action` with the same benchmark config. Every pull request runs one observational, non-gating stable suite covering Rust, JavaScript, CLI, Elixir, package size, and memory. It appends available benchmark tables to the GitHub Actions job summary and retains raw report artifacts for seven days.

## Dynamic language packages

`languages.toml` is the repository source of truth. Generated runtime catalogs
contain only stable language IDs, aliases, and npm package names. `crates/dev`
generates the checked-in Rust catalog data, which `lumis-wasm-runtime` expands
through a declarative macro. JavaScript generation owns only JavaScript runtime
metadata.

Each `@lumis-sh/wasm-*` release is the independently versioned, atomic unit
containing:

- one parser WASM
- every Lumis language backed by that parser
- the matching highlight, injection, locals, and bracket queries
- parser size, SHA-256, grammar name, and package version

During staging, `crates/dev` serializes those inputs into `language.json`. The
manifest is published inside the language package and is not checked in.

Changing a parser or one of its queries publishes only that language package.
It does not require a JavaScript, CLI, Rust, or Elixir runtime release unless
the language-package format itself changes.

Dynamic runtimes resolve and cache the current package metadata, then load the
exact parser identified by that metadata:

```text
stable language catalog
         |
         v
installed/local language package -> persistent metadata cache -> current package metadata
         |
         v
installed/local parser -> persistent verified parser cache -> exact-version CDN parser
                                  |
                                  +-> persistent Wasmtime compiled cache
```

Node and the CLI use platform directories, browsers use CacheStorage, and
Elixir checks release-local `priv/wasm` before the user cache. Parser cache keys
contain the parser name, package version, and digest, so upgrades do not
overwrite older verified assets. Cached metadata can be refreshed independently
while stale validated metadata remains usable if the refresh fails.
