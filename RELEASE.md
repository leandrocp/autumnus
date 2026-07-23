# Release

Releases are prepared locally and published from tags.

## TLDR

```sh
mise run release-needed
mise run release-prepare <package> <version>
git add <changed-files>
git commit -m "chore(release): <package> <version>"
git push origin main
git tag <package>/v<version>
git push origin <package>/v<version>
```

Example:

```sh
mise run release-needed
mise run release-prepare cargo-lumis-cli 0.2.0
git add crates/lumis-cli/Cargo.toml crates/lumis-cli/CHANGELOG.md
git commit -m "chore(release): cargo-lumis-cli 0.2.0"
git push origin main
git tag cargo-lumis-cli/v0.2.0
git push origin cargo-lumis-cli/v0.2.0
```

- Run `mise run release-needed` first to decide which packages ship together. It ignores `chore` commits.
- Pass the bare version to `mise run release-prepare`, for example `0.2.0`, not `v0.2.0`.
- Include `v` only in the git tag, for example `cargo-lumis-cli/v0.2.0`.
- Review each changed manifest and `CHANGELOG.md` after `mise run release-prepare`.
- If one released package depends on another released package, update the dependent manifest in the same commit.
- Push package tags in dependency order.
- Watch the tag-triggered publish workflows after pushing tags.

## Publish order

Publish dependency packages before the packages that consume them.

### Rust crates

If multiple Rust crates are part of the same release, use this order:

1. `cargo-lumis-core`
2. `cargo-lumis-build`
3. `cargo-lumis-wasm-runtime`
4. `cargo-lumis`
5. `cargo-lumis-cli`

`lumis-wasm-runtime` depends on `lumis-core`. `lumis` and `lumis-cli` depend on
`lumis-core`, `lumis-build`, and `lumis-wasm-runtime`. `cargo-lumis-core` and
`cargo-lumis-build` are independent, but keep the order above for consistency.

### JavaScript packages

If multiple JS packages are part of the same release, use this order:

1. `npm-themes`
2. `npm-lumis`
3. `npm-markdown-it-lumis`
4. `npm-rehype-lumis`
5. `npm-react`
6. `npm-cli`
7. `npm-wasm-bundle-web`
8. `npm-wasm-bundle-web-extra`
9. `npm-wasm-bundle-system`
10. `npm-wasm-bundle-backend`
11. `npm-wasm-bundle-full`

`@lumis-sh/lumis` builds against `@lumis-sh/themes`. `@lumis-sh/markdown-it-lumis`, `@lumis-sh/rehype-lumis`, and `@lumis-sh/react` depend on `@lumis-sh/lumis`. The `@lumis-sh/wasm-bundle-*` packages declare `@lumis-sh/lumis` as a peer dependency.

After `npm-lumis` is published, the plugin packages, CLI package, and WASM bundle packages are independent. Keep the order above as the canonical release order.

`npm-cli` must use the same version as `cargo-lumis-cli`, and the matching `cargo-lumis-cli/v<version>` GitHub release must already contain prebuilt CLI archives before publishing `@lumis-sh/cli`.

If a JS release also needs new parser WASM packages, publish those first through the WASM workflow. Run `mise run wasm-publish-needed` to see which parser packages still need publishing.

### Elixir package

Publish `hex-lumis` after any required `cargo-lumis` release because `packages/elixir/lumis/native/lumis_nif/Cargo.toml` depends on `lumis`.

## Failed releases

If a release fails before any registry accepts the new version:

1. Delete every package tag from the failed attempt.
2. Fix the mistake on `main`.
3. Run `mise run release-prepare <package> <version>` again for each affected package.
4. Commit the updated changelog and version bump.
5. Push the corrected package tags in dependency order.

If any registry already published the version, do not reuse it. Cut a new patch release instead.

## Tag format

Use one tag per released package:

- `cargo-lumis/v0.7.1`
- `cargo-lumis-core/v0.1.0`
- `cargo-lumis-build/v0.0.1`
- `cargo-lumis-cli/v0.1.4`
- `npm-lumis/v0.2.0`
- `npm-markdown-it-lumis/v0.1.0`
- `npm-rehype-lumis/v0.1.0`
- `npm-react/v0.1.0`
- `npm-cli/v0.4.0`
- `npm-themes/v0.0.3`
- `npm-wasm-bundle-web/v0.0.4`
- `npm-wasm-bundle-web-extra/v0.0.3`
- `npm-wasm-bundle-system/v0.0.4`
- `npm-wasm-bundle-backend/v0.0.4`
- `npm-wasm-bundle-full/v0.0.6`
- `hex-lumis/v0.3.0`

## Git-cliff

All packages share the root `cliff.toml` template.

`mise run release-prepare` picks the right files for the package you name. For example, `cargo-lumis-cli` maps to:

- version file: `crates/lumis-cli/Cargo.toml`
- changelog: `crates/lumis-cli/CHANGELOG.md`
- tag format: `cargo-lumis-cli/v<version>`
- commit scope for changelog generation: `crates/lumis-cli/**/*`

Example:

```sh
mise run release-prepare cargo-lumis-cli 0.2.0
```

`release-prepare` updates only the target package version file and prepends the next changelog entry with `git-cliff`.

If a release requires dependent manifests to move in lockstep, update those files separately and commit them with the release prep.
