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

### Route work through `just`

`justfile` is the control plane for this repository.

- Prefer `just` recipes over raw tool invocations.
- If a repeated workflow does not have a recipe yet, add or update the `justfile` instead of documenting an ad hoc command sequence.
- Use the existing top-level entry points whenever possible: `just setup`, `just fmt`, `just lint`, `just test`, `just test-conformance`, `just docs`, `just dev`, and `just docs-site`.

### Treat structural changes as design work

Changes to repository layout, package boundaries, generated artifact flow, release mechanics, shared API shape, or build orchestration are structural changes.

Those changes require review. They also require checking whether `CONTRIBUTING.md`, `RELEASE.md`, and `ARCHITECTURE.md` still describe reality. If they do not, update them in the same change.

### Rust rules are stricter, not looser

Rust is the reference implementation and must follow the Rust API Guidelines:

- https://rust-lang.github.io/api-guidelines/checklist.html

Prefer guideline-compliant naming, error behavior, builder patterns, documentation, and trait usage. Do not introduce a Rust API shortcut that other runtimes cannot sensibly mirror.

## Documentation is part of the change

Docs, specs, and examples are not cleanup work for later. They are part of the feature.

- Keep README files, package docs, examples, and generated references consistent with the shipped behavior.
- If a change affects public API, behavior, configuration, or generated outputs, update the relevant docs and examples in the same PR.
- If writing needs polish, use the available `humanizer` skill before finishing.

Prefer concrete explanations over marketing language. Show the real API. Keep examples runnable.

## Website and docs site

This repo ships two documentation surfaces:

- `website/` for the main site and demos
- `docs/` for the Docusaurus docs app published under `/docs`

Code changes that affect user-facing behavior often need updates in one or both places. Do not treat the website and docs site as downstream afterthoughts.

## Generated artifacts and shared data

Large parts of the repository are generated from shared inputs such as `languages.toml`, `highlights.toml`, themes, queries, and conformance fixtures.

- Edit the source inputs, not generated outputs, unless the generated file is the intended source.
- Regenerate checked-in artifacts with the documented `just` workflows.
- Keep Rust, JavaScript, Elixir, docs, fixtures, and generated metadata in sync.

## Verification

Match verification to the scope of the change, but do not stop at a partial check when a broader shared workflow is affected.

Common entry points:

- `just fmt`
- `just lint`
- `just test`
- `just test-conformance`
- `just docs`

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
4. run the work through `just`
5. update docs, examples, website, and docs site before calling the work done
