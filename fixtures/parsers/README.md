# Parsers CI cannot build

A `.wasm` here is a grammar that `mise run wasm-build` produces locally but a CI
runner cannot, so query compilation would otherwise have no parser to check its
queries against. Under complete coverage that is a failed shard, because
`unverified-parsers.json` describes the state of npm and is deliberately not
consulted there.

Each file is built from the revision `languages.toml` pins at the time it is
committed, with `mise run wasm-build <parser>`, and copied from
`tmp/wasm/build/`. Rebuild and replace it when that revision changes, the same
as any other pinned artifact.

This list may only shrink. A grammar belongs here only while CI genuinely cannot
build it; delete the file once it can. Add one only after a CI run has actually
failed on it, not because a build looks expensive locally.
