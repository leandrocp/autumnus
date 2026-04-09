# Release

This repository publishes packages from tags.

## Checklist

1. Pick the package and version.
2. Run `just release-prepare <package> <version>`.
3. Review the changed version file and `CHANGELOG.md`.
4. If needed, update dependent manifests in the same commit.
5. Commit the release prep.
6. Push the commit to `main`.
7. Push the tag: `git push origin <package>/v<version>`.
8. Watch the tag-triggered publish workflow.
9. If publish fails because dependent packages also need releases, prepare and tag those packages separately.

## Failed releases

If a release fails before any registry accepts the new version:

1. Delete every package tag created for that failed attempt.
2. Fix the mistake on `main`.
3. Run `just release-prepare <package> <version>` again.
4. Commit the updated changelog and version bump.
5. Push the corrected package tag.

If any registry already published the version, do not try to reuse it. Cut a new patch release instead.

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
- `npm-themes/v0.0.3`
- `npm-wasm-bundle-web/v0.0.4`
- `npm-wasm-bundle-web-extra/v0.0.3`
- `npm-wasm-bundle-system/v0.0.4`
- `npm-wasm-bundle-backend/v0.0.4`
- `npm-wasm-bundle-full/v0.0.6`
- `hex-lumis/v0.3.0`

## Git-Cliff

All packages share the root `cliff.toml` template.

The `just release-prepare` recipe picks the right files for the package you name.

For example, `cargo-lumis-cli` means:

- version file: `crates/lumis-cli/Cargo.toml`
- changelog: `crates/lumis-cli/CHANGELOG.md`
- tag format: `cargo-lumis-cli/v<version>`
- commit scope for changelog generation: `crates/lumis-cli/**/*`

Example:

```sh
just release-prepare cargo-lumis-cli 0.2.0
```

`release-prepare` updates only the target package version file and prepends the next package changelog entry with `git-cliff`.

If a release requires dependent manifests to move in lockstep, update those files separately and commit them with the release prep.
