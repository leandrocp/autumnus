# Architecture

```text
+------------------+ +---------------+ +------------------+
| languages.toml   | | themes/*.json | | queries/**/*.scm |
| parser metadata  | | theme data    | | highlight rules  |
+--------+---------+ +-------+-------+ +---------+--------+
         |                   |                   |
         v                   v                   v
+--------------------------------------------------------------+
| justfile + crates/dev                                        |
| setup / lint / test / docs / codegen / packaging             |
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
| language detection + theme/style logic + formatter behavior  |
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
