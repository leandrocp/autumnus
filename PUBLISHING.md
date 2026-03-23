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
| `themes@v*` | @lumis-sh/themes | npm |
| `elixir@v*` | lumis | hex.pm |

WASM parsers have no tags. They publish via `workflow_dispatch`.

## Workflows

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `release-please.yml` | Push to `main` | Opens release PRs, creates tags and GitHub Releases on merge |
| `rust-release.yml` | `rust*@v*` tags | `cargo publish` for the matching crate |
| `javascript-release.yml` | `javascript@v*` or `themes@v*` tags | `pnpm publish` to npm |
| `elixir-nif-release.yml` | `elixir@v*` tag | Builds precompiled NIF binaries, uploads to GitHub Release |
| `elixir-hex-release.yml` | Manual (`workflow_dispatch`) | Downloads NIF checksums, publishes to hex.pm |
| `wasm-release.yml` | Manual (`workflow_dispatch`) | Builds and publishes WASM parser packages to npm |

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

### Elixir

1. Merge the release-please PR (creates `elixir@v*` tag)
2. Wait for `Elixir NIF Release` workflow to finish (builds NIF binaries)
3. Manually trigger `Elixir Hex Release` workflow: `gh workflow run "Elixir Hex Release"`

### WASM

Run manually when parser versions change:

```sh
gh workflow run "WASM Release"
gh workflow run "WASM Release" -f parser=rust,javascript  # specific parsers
```

The workflow auto-detects which packages need publishing.

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
