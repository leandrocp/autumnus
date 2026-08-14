# Parsers the test suites load

One copy of each grammar the Rust, CLI, JavaScript, browser and Elixir suites
parse with, so a parser bump is one file to replace rather than several to keep
in step. `crates/dev`'s `stage-test-parsers` lays this directory out as a Lumis
store under `target/test-parsers`, and `packages/javascript/lumis/test/wasm.ts`
serves the same files to the JavaScript runtimes.

Two of these lived in `crates/lumis-cli/tests/fixtures/parsers/` and in
`packages/javascript/lumis/test/fixtures/wasm/` at once, byte for byte, and
`lumis-wasm-runtime`'s own tests reached across crates into the first. A query
and the parser it is written against ship together, so a bump that refreshed one
copy left the other compiling the query against the grammar it replaced.

Build one with `mise run wasm-build <parser>` and copy it from `tmp/wasm/build/`.

Not to be confused with [`../parsers`](../parsers/README.md), which holds the
few grammars CI cannot build at all. Those are inputs to query compilation
rather than to the test suites, and that list may only shrink.
