# Parsers CI cannot build

A `.wasm` here is a grammar that `mise run wasm-build` produces locally but a CI
runner cannot, so query compilation would otherwise have no parser to check its
queries against. Under complete coverage that is a failed shard, because
`unverified-parsers.json` describes the state of npm and is deliberately not
consulted there.

The reason is memory. `tree-sitter build --wasm` compiles the generated
`parser.c` through a WASI SDK it fetches itself, and a few grammars need more
than a GitHub runner's 16 GB. Measured peak resident size while building:

| Grammar | Peak RSS |
| --- | --- |
| `tree-sitter-vim` | 18.3 GB |
| `tree-sitter-llvm` | 10.5 GB |
| everything else | under 6 GB |

Each file is built from the revision `languages.toml` pins at the time it is
committed, with `mise run wasm-build <parser>`, and copied from
`tmp/wasm/build/`. Rebuild and replace it when that revision changes, the same
as any other pinned artifact.

This list may only shrink. A grammar belongs here only while CI genuinely cannot
build it; delete the file once it can.
