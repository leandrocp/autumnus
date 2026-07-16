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
| generated JS metadata   |   |     | wasm packages / local     |
| langs / bundles /       |   |     | parser distribution       |
| detection / loaders     |   |     +---------------------------+
+------------+------------+   |                    |
             |                |                    |
             +----------------+--------------------+
                                  |
                                  v
+--------------------------------------------------------------+
| lumis-core (Rust crate)                                      |
| language guessing + theme/style + formatter behavior         |
+-----------------------------+--------------------------------+
                              |
                              v
+--------------------------------------------------------------+
| lumis (Rust crate)                                           |
| public Rust API + tree-sitter adapter                        |
+------+----------------+--------------------------+-----------+
       |                |                          |
       v                v                          v
+-------------------+ +--------------------+ +-------------------------+
| lumis-cli         | | elixir/lumis (hex) | | javascript/lumis (npm)  |
| Rust binary crate | | Rustler NIF        | | web-tree-sitter runtime |
+-------------------+ +--------------------+ +-----------+-------------+
                                                       |
                                                       v
                                         +---------------------------+
                                         | website/                  |
                                         | docs + demos + examples   |
                                         +---------------------------+
```

## Performance benchmark lane

`benchmarks/` is an intentionally non-published comparison layer over the public Rust, JavaScript, and CLI surfaces.

```text
benchmarks/fixtures + deterministic generator
                    |
                    v
       identical small and large Rust inputs
          +---------+---------+
          |         |         |
          v         v         v
   Rust/Criterion  JS/Mitata  CLI/Hyperfine
   Lumis/syntect   Lumis/Shiki npm Lumis/bat
          |         |         |
          +---------+---------+
                    |
                    v
 target/benchmarks/runs/<run>/ native reports + summary + metadata
```

The Rust benchmark package is its own Cargo workspace so syntect and Criterion do not enter normal production workspace builds. The private JavaScript benchmark package joins the pnpm workspace so it can consume locally built Lumis packages while keeping Shiki and Mitata out of published manifests.

Fixture generation, optimized artifact builds, timed execution, memory sampling, cache preparation, and reporting are separate mise tasks. `benchmarks/mise.toml` pins the benchmark toolchain, models task dependencies and incremental sources/outputs, and owns shared paths. Root `mise run bench-*` tasks delegate to that benchmark configuration. The root `mise.toml` intentionally does not pin runtime versions. Timed families execute serially. CLI first-use owns an isolated data/cache directory and includes automatic parser WASM download; repeat-use starts from a prepared parser and Wasmtime cache.

CI uses `jdx/mise-action` with the same benchmark config. Every pull request runs one observational, non-gating stable suite covering Rust, JavaScript, CLI repeat use, and memory. It appends available benchmark tables to the GitHub Actions job summary and retains raw report artifacts for seven days. The network-inclusive first-use scenario remains local-only.
