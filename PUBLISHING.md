# Publishing

## Secrets

| Secret | Where | Purpose |
|--------|-------|---------|
| `CARGO_REGISTRY_TOKEN` | GitHub repo | crates.io publish |
| `NPM_TOKEN` | GitHub repo | npm publish |
| `HEX_API_KEY` | GitHub repo | hex.pm publish |

## Tags

| Tag | Package | Registry |
|-----|---------|----------|
| `rust@v*` | lumis | crates.io |
| `rust-core@v*` | lumis-core | crates.io |
| `rust-build@v*` | lumis-build | crates.io |
| `rust-cli@v*` | lumis-cli | crates.io |
| `javascript@v*` | @lumis-sh/lumis | npm |
| `markdown-it-lumis@v*` | @lumis-sh/markdown-it-lumis | npm |
| `rehype-lumis@v*` | @lumis-sh/rehype-lumis | npm |
| `themes@v*` | @lumis-sh/themes | npm |
| `wasm-bundle-*@v*` | matching `@lumis-sh/wasm-bundle-*` package | npm |
| `elixir@v*` | lumis | hex.pm |

WASM parser packages `@lumis-sh/wasm-*` have no tags. They publish automatically from `main` when parser metadata, vendored parser sources, queries, or generated WASM outputs change, or manually via `workflow_dispatch`.

## Workflows

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `release-please.yml` | Push to `main` | Opens release PRs, creates tags and GitHub Releases on merge |
| `rust-release.yml` | `rust*@v*` tags | `cargo publish` for the matching crate |
| `javascript-release.yml` | `javascript@v*`, `markdown-it-lumis@v*`, `rehype-lumis@v*`, `themes@v*`, or `wasm-bundle-*@v*` tags | `pnpm publish` to npm |
| `elixir-release.yml` | `elixir@v*` tag | Builds precompiled NIF binaries, uploads them to the GitHub Release, then publishes the Hex package |
| `wasm-release.yml` | Push to `main` when parser metadata, vendored parser sources, queries, or generated WASM outputs change, or manual (`workflow_dispatch`) | Detects unpublished `@lumis-sh/wasm-*` parser packages and publishes only the ones that still need release |

## Publishing order

### Rust

Crates depend on each other. Publish in this order:

1. `lumis-build`
2. `lumis-core`
3. `lumis` and `lumis-cli` (both depend on lumis-core, independent of each other)

Merge the release-please PRs in that order. Each merge creates a tag, which triggers `cargo publish`.

### JavaScript

1. `@lumis-sh/themes` first (lumis depends on it)
2. `@lumis-sh/lumis`
3. `@lumis-sh/markdown-it-lumis` and `@lumis-sh/rehype-lumis`

### Elixir

1. Merge the release-please PR (creates `elixir@v*` tag)
2. `elixir-release.yml` builds the precompiled NIF binaries and publishes the Hex package automatically

### WASM

WASM publishing is split into parser packages and bundle packages:

1. Parser package changes from `languages.toml`, vendored parser sources, queries, generated WASM outputs, or `update-langs` PR merges trigger `wasm-release.yml` on `main`.
2. `wasm-release.yml` auto-detects which `@lumis-sh/wasm-*` packages are still unpublished and only publishes those.
3. Bundle package changes under `packages/javascript/wasm-bundle-*` are release-managed and publish through `javascript-release.yml` once their release PRs are merged.

You can still run parser publishing manually:

```sh
gh workflow run "WASM Release"
gh workflow run "WASM Release" -f parser=rust,javascript  # specific parsers
```

The workflow auto-detects which parser packages need publishing.

## Commit conventions

Release-please reads [Conventional Commits](https://www.conventionalcommits.org/) to generate changelogs and determine version bumps:

- `fix:` -- patch bump
- `feat:` -- minor bump
- `feat!:` or `BREAKING CHANGE:` footer -- major bump

Scope commits to packages when a change only affects one:

```
feat(lumis-cli): add --output flag
fix(javascript): handle empty source input
```
