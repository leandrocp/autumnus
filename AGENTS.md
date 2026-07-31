# AGENTS.md

## Project overview

Lumis is a multi-runtime syntax highlighter built around the same core workflow across Rust, CLI, Elixir, JavaScript, browser, and Java:

1. choose a language
2. choose a theme
3. choose a formatter
4. render highlighted output

This repository is a monorepo. Rust crates, JavaScript packages, Elixir bindings, generated assets, examples, the website, and the docs site all move together.

## Read this first

Before making changes, agents must read:

- `CONTRIBUTING.md`
- `RELEASE.md`
- `ARCHITECTURE.md`

Those files define the build pipeline, release model, generated artifacts, and how the repository is wired together. Do not guess when they already answer the question.

## Operating rules

### Keep the API aligned across runtimes

Lumis should present one mental model everywhere. Public APIs across languages should stay aligned in naming, argument shape, defaults, return behavior, formatter flow, and feature coverage.

The Rust implementation is the source of truth. When a cross-runtime API decision is unclear, follow Rust first and bring other runtimes into line with it instead of inventing runtime-specific behavior.

### Reuse the Rust core instead of reimplementing it

Shared behavior belongs in one Rust crate that every runtime consumes. A second implementation of the same logic in another language, or in another Rust crate, is a divergence that will drift.

- Before writing logic in JavaScript, Elixir, the CLI, or a build script, check whether `crates/lumis-core`, `crates/lumis`, `crates/lumis-wasm-runtime`, or `crates/lumis-build` already owns it, and extend that crate instead.
- Prefer moving work to generation time in Rust over duplicating it per runtime. Query preprocessing is the model: `crates/lumis-build` converts Lua patterns once, and every runtime then reads byte-identical `.scm` files.
- When a runtime genuinely cannot call into Rust, such as the browser, the Rust crate still defines the behavior, and the port must be covered by a test that pins both against the same input.
- Two copies of the same algorithm require a test that pins them to each other. `scripts/wasm-needed.py` and `crates/dev` computing the same `definitionHash` is exactly the kind of pair that needs one.

### Route work through `mise`

`mise.toml` is the control plane for this repository. It defines tasks without pinning runtime versions, so local commands use the developer's installed Rust, JavaScript, Elixir, and other toolchains.

- Prefer `mise run` tasks over raw tool invocations.
- If a repeated workflow does not have a task yet, add or update `mise.toml` instead of documenting an ad hoc command sequence.
- Use the existing top-level entry points whenever possible: `mise run setup`, `mise run fmt`, `mise run lint`, `mise run test`, `mise run test-conformance`, `mise run docs`, `mise run dev`, and `mise run docs-site`.

### Theme extraction and Neovim plugins

Theme extraction uses Neovim's built-in plugin manager, `vim.pack`.

- Read the upstream docs before changing this flow: <https://neovim.io/doc/user/pack/#_plugin-manager>
- `vim.pack` manages plugins under `stdpath("data") .. "/site/pack/core/opt"`. In this repo, `themes/init.lua` sets `XDG_DATA_HOME` to the repo-local `nvim/data`, so extraction must not touch a user's normal Neovim install.
- Do not manually mutate `vim.pack` managed plugin repositories with raw `git` commands unless there is no supported `vim.pack` API for the operation.
- `vim.pack.add()` installs missing plugins and makes them available in the current session, but it does not update an existing plugin's revision.
- Use `vim.pack.update()` when theme generation needs fresh upstream plugin revisions. Use non-interactive options in automation.
- Keep plugin directory names explicit and collision-safe. The name field controls the managed directory name, and case-only repo differences can collide on macOS filesystems.

### Treat structural changes as design work

Changes to repository layout, package boundaries, generated artifact flow, release mechanics, shared API shape, or build orchestration are structural changes.

Those changes require review. They also require checking whether `CONTRIBUTING.md`, `RELEASE.md`, and `ARCHITECTURE.md` still describe reality. If they do not, update them in the same change.

### Rust rules are stricter, not looser

Rust is the reference implementation and must follow the Rust API Guidelines:

- <https://rust-lang.github.io/api-guidelines/checklist.html>

Prefer guideline-compliant naming, error behavior, builder patterns, documentation, and trait usage. Do not introduce a Rust API shortcut that other runtimes cannot sensibly mirror.

### Tree-sitter is the driver

Lumis is a Tree-sitter-based syntax highlighter. Language behavior must respect Tree-sitter's design, mechanics, and query model rather than bypassing them with ad hoc text scanning.

- Use Tree-sitter parsers, syntax trees, captures, predicates, and query metadata as the source of truth for language-aware behavior.
- Treat `.scm` query files as executable language behavior, not just generated assets to carry around.
- For cross-runtime features, define the behavior in Rust first, then align JavaScript, Elixir, browser, Java, and CLI behavior to the Rust implementation.
- Do not replace language-specific query semantics with generic string scanning unless it is an explicit fallback for plaintext or unavailable parser/query data.

### Neovim is the reference for query semantics

Lumis queries are fetched from <https://github.com/nvim-treesitter/nvim-treesitter>, so those `.scm` files mean whatever Neovim's highlighting engine says they mean. Neovim, not Tree-sitter's documentation and not a plausible reading of the pattern, decides the intended behavior.

- Before changing predicate handling, query preprocessing, or capture resolution, read the upstream implementation. Clone it locally: `git clone --depth 1 --filter=blob:none --sparse https://github.com/neovim/neovim.git "$(mktemp -d)/nvim"`, then `git sparse-checkout set runtime/lua/vim/treesitter`.
- The predicate handlers live in `runtime/lua/vim/treesitter/query.lua`. Two of them are easy to conflate:
  - `#lua-match?` is `string.find(node_text, pattern)`, so its argument is a **Lua 5.1 pattern**, matched unanchored unless it starts with `^`.
  - `#match?` (aliased as `#vim-match?`) is `vim.regex('\v' .. pattern)`, a **Vim very-magic regex**. Lumis instead evaluates `#match?` with Tree-sitter's own implementation: the `regex` crate in Rust and `RegExp` in `web-tree-sitter`.
- A Lua pattern is not a regex. `-` is the lazy `*` only after a pattern item, `^` anchors only at the start, `$` only at the end, `.` matches newlines, and `%d`/`%s`/`%w` are ASCII in the C locale. `crates/lumis-build` owns that translation; extend it rather than hand-editing generated queries.
- Any translated pattern must be valid **and equivalent** in both the `regex` crate and JavaScript `RegExp` with no flags. The two disagree on nested character classes, `\d`/`\w`/`\s` width, and inline `(?i)` groups. `crates/lumis-build/tests/processed_queries.rs` and `packages/javascript/lumis/test/query-patterns.test.ts` enforce this over the whole corpus and must not be allowed to skip languages.
- Settle a question about pattern semantics by running it, not by reasoning about it: `nvim --headless -c 'lua print(string.find(subject, pattern))' -c q`.
- The converter stays faithful to Neovim even when upstream is wrong. Fix an authoring mistake in `queries/override/` or `queries/append/` instead, where it is visible in review, and say in a comment what upstream does and why it is wrong.

### A test that cannot fail is worse than no test

A test that skips silently reports the same green as a test that verified something. That is how the defects in `CLAUDE_REVIEW.md` §1 shipped: the only per-language query check `return`ed early for 77 of 115 languages.

- Never `return` or `continue` out of a test body to handle a missing prerequisite. Fail, or record the gap in a checked-in file that the test enforces.
- A gap that genuinely cannot be closed yet gets an explicit waiver that can only shrink. The test must fail on an undeclared gap **and** on a waiver entry that is no longer needed. `packages/javascript/lumis/test/unverified-parsers.json` is the pattern.
- Assert corpus size. `expect(patterns.length).toBeGreaterThan(200)` is what catches a discovery bug that silently finds nothing.
- Prove a new guard fails: inject the defect it is meant to catch, watch it go red, then revert. A guard that has never failed has not been tested.
- Do not let published artifacts gate correctness checks. Build what you need from the pinned source instead, as `mise run test-queries` does, otherwise coverage silently tracks the release cycle.

### Keep Emscripten compatible with Tree-sitter

Emscripten is pinned as `emsdk` in the root `mise.toml`, so every runner and every developer builds parsers with the same toolchain. There is no `setup-emsdk` step; `mise run wasm-build` puts `emcc` on `PATH`.

This failure looks like a toolchain problem and usually is not:

```
bad export type for 'tree_sitter_<lang>_external_scanner_create': undefined
```

A parser that triggers it **compiles cleanly** and only fails when something loads it, and only when the grammar has an external scanner. So a green build proves nothing — load the parser.

Historically this was blamed on Emscripten (<https://github.com/tree-sitter/tree-sitter/issues/5037>). That is no longer reproducible with the pinned Tree-sitter CLI. Measured on `tree-sitter-hcl`, holding the toolchain fixed and varying only the grammar revision:

| Grammar revision | emsdk 4.0.15 | emsdk 6.0.5 |
| --- | --- | --- |
| `636dbe70`, pinned in `languages.toml` | fails to load | fails to load |
| `64ad6278`, what the published package ships | loads | loads |

So the cause is a **stale grammar revision**, not the Emscripten version. When a scanner-bearing language fails to load, check whether `languages.toml` has fallen behind the revision the published package was built from before touching the toolchain.

## Documentation is part of the change

Docs, specs, and examples are not cleanup work for later. They are part of the feature.

- Keep README files, package docs, examples, and generated references consistent with the shipped behavior.
- If a change affects public API, behavior, configuration, or generated outputs, update the relevant docs and examples in the same PR.
- If writing needs polish, use the available `humanizer` skill before finishing.

Prefer concrete explanations over marketing language. Show the real API. Keep examples runnable.

### READMEs stay small, detail lives in the docs site

READMEs are entry points, not manuals. Keep them small, direct, and targeted: the minimal usage to get started, then a link to the relevant page under `docs/content/`.

- Put detailed guides, option references, multi-runtime examples, and edge cases in `docs/content/`, not in READMEs.
- When a feature spans runtimes, document it once in `docs/content/` using runtime `Tabs` (`<Tabs groupId="runtime" ...>` with JavaScript, Rust, Elixir, Java, CLI), instead of repeating it in each package README.
- A README mention of a new capability should be one or two lines plus a link to the docs page (use the published `https://lumis.sh/docs/<slug>` URL).
- Internal docs cross-links use slug form, e.g. `/themes/css-files#build-custom-css`.

## Website and docs site

This repo ships two documentation surfaces:

- `website/` for the main site and demos
- `docs/` for the Docusaurus docs app published under `/docs`

Code changes that affect user-facing behavior often need updates in one or both places. Do not treat the website and docs site as downstream afterthoughts.

## Generated artifacts and shared data

Large parts of the repository are generated from shared inputs such as `languages.toml`, `highlights.toml`, themes, queries, and conformance fixtures.

- Edit the source inputs, not generated outputs, unless the generated file is the intended source.
- For query changes, treat `queries/upstream/` as fetched source material, `queries/override/` as full replacements, and `queries/append/` as additive local patches.
- Regenerate checked-in artifacts with the documented `mise run` workflows.
- Keep Rust, JavaScript, Elixir, docs, fixtures, and generated metadata in sync.

## Verification

Match verification to the scope of the change, but do not stop at a partial check when a broader shared workflow is affected.

Common entry points:

- `mise run fmt`
- `mise run lint`
- `mise run test`
- `mise run test-conformance`
- `mise run docs`

For language, theme, query, docs-generation, or bundle changes, run the relevant regeneration commands described in `CONTRIBUTING.md` and commit the resulting tracked files.

## Release discipline

This repository uses `knope` and automation-driven release PRs.

- Do not hand-edit versions or changelog release sections in normal feature work.
- Follow `RELEASE.md` for release-specific tasks.
- If a change affects packaging, tags, publish behavior, or release metadata expectations, treat it as a release-sensitive change and review the release docs before touching anything.

## Commit messages

- Use Conventional Commits for git commit messages.
- Prefer a clear type and scope when they help, for example `fix(rust): ...` or `docs(website): ...`.
- Keep the subject concise and descriptive.

## Practical default

When in doubt:

1. read the three core docs
2. make the smallest correct change
3. keep Rust as the reference
4. run the work through `mise`
5. update docs, examples, website, and docs site before calling the work done
