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

### Keep Emscripten compatible with Tree-sitter

Pin Emscripten to `4.0.15` for the Tree-sitter browser runtime. Emscripten 6 is currently incompatible with Tree-sitter side modules because their mutable `env.__stack_pointer` import is not supplied as the required `WebAssembly.Global`; see <https://github.com/tree-sitter/tree-sitter/issues/5037>.

Do not upgrade Emscripten until that incompatibility is resolved upstream and Lumis verifies loading real Tree-sitter parser side modules in browser conformance tests.

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
