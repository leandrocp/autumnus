# Parsers CI cannot build

A `.wasm` here is a grammar that `mise run wasm-build` produces locally but a CI
runner cannot, so query compilation would otherwise have no parser to check its
queries against.

The reason is memory. `tree-sitter build --wasm` compiles the generated
`parser.c` through the WASI SDK, and a few grammars need more than a standard
GitHub runner has: `tree-sitter-llvm` peaks around 7.8 GB against the runner's
7 GB.

Each file is built from the revision `languages.toml` pins at the time it is
committed, with `mise run wasm-build <parser>`, and copied from
`tmp/wasm/build/`. Rebuild and replace it when that revision changes, the same
as any other pinned artifact.

This list may only shrink. A grammar belongs here only while CI genuinely cannot
build it; delete the file once it can.
