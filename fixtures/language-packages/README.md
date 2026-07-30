# Language-package validation corpus

One `language.json` document per file. Every runtime that parses a language package must reach the
**same accept/reject verdict** on every file here.

- `valid/` — must parse and validate.
- `invalid/` — must be rejected. The reason is the filename.

Consumers:

- `crates/lumis-wasm-runtime/tests/language_package_corpus.rs` (Rust; the CLI and the Elixir NIF
  both validate through this crate)
- `packages/javascript/lumis/test/language-package-corpus.test.ts` (Node and browser runtimes)

Both tests assert the corpus size, so a discovery bug that silently finds no fixtures fails.

Every document declares `packageName: "@lumis-sh/wasm-json"`. The corpus covers *document validity*
only. There is no `formatVersion` field and no version gate: the format is additive-only, so
compatibility is decided by shape. Unknown fields are ignored by both runtimes, and a missing
required field is rejected by name.

Checking that a fetched package's name matches the one that was requested happens a layer up, in
`Registry::fetch_package`, `parse_language_package`, and `parseLanguagePackage`'s
`expectedPackageName` argument.

`language-missing-aliases.json` and `parser-size-zero.json` exist because Rust and JavaScript
disagreed on exactly those two documents: Rust accepted both, JavaScript rejected both. When adding
a field to the format, add a fixture here in the same change.
