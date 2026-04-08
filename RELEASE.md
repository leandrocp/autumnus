# Release

This repository uses `knope` for release preparation and GitHub Actions for publishing.

## Release flow

1. Merge normal work into `main`.
2. Wait for the `Prepare Release` workflow to update or create the `knope/release` PR.
3. Review the release PR:
   - versions
   - changelog entries
   - included packages
4. If needed, adjust release metadata on the release branch yourself.
5. Merge the `knope/release` PR.
6. The `Release` workflow creates package tags and GitHub releases.
7. Tag-triggered publish workflows run for npm, crates.io, and Hex.

## Failed releases

If a release fails before any registry accepts the new version:

1. Delete the GitHub releases created for that failed attempt.
2. Delete every package tag created for that failed attempt.
3. Fix the mistake on `main`.
4. Let the `knope/release` PR regenerate.
5. Merge it and release the same version again.

If any registry already published the version, do not try to reuse it. Cut a new patch release instead.

## Tag format

Knope creates one tag per released package:

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

## What is automated

- release PR creation and updates
- version bumps
- changelog updates
- package tagging
- GitHub release creation
- npm publishing
- crates.io publishing
- Hex publishing

## What is manual

- deciding when to ship
- reviewing the release PR
- fixing release metadata if the generated branch is wrong
- merging the release PR

## Changesets

Release changesets are maintainer-managed.

Contributors are not expected to add `.changeset/*.md` files unless you ask for it.

When you need to create or edit release metadata yourself, use:

```sh
knope document-change
```

That creates a `.changeset/*.md` file using the package keys defined in `knope.toml`.

## Important notes

- Do not hand-edit package versions in normal feature PRs.
- Do not hand-edit changelog release sections in normal feature PRs.
- `packages/elixir/lumis/native/lumis_nif/Cargo.toml` is not released independently.
- The Hex release is represented only by `hex-lumis`.

## Required secret

Set `RELEASE_TOKEN` in GitHub Actions with repo write access.

The workflows fall back to `GITHUB_TOKEN`, but a write-capable token is the safer setup for creating tags and triggering downstream publish workflows consistently.
