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
- If one released package depends on another released package, update the dependent manifest in the same commit. See [Crate version requirements](#crate-version-requirements).
- Push package tags in dependency order.
- Watch the tag-triggered publish workflows after pushing tags.
- Keep the commit subject exactly `chore(release): <package> <version>`. See [CI on the release commit](#ci-on-the-release-commit).

## CI on the release commit

A release commit is a version bump and a changelog entry on top of a commit CI
already passed, so every branch workflow skips itself when the pushed head
commit's subject starts with `chore(release):`:

```yaml
    if: >-
      ${{ github.event_name != 'push' ||
          !startsWith(github.event.head_commit.message, 'chore(release):') }}
```

Two consequences worth knowing:

- **The prefix is the contract.** A subject spelled any other way runs the full
  matrix — Rust, JavaScript, Elixir, the NIF, conformance, queries, lint,
  benchmarks and the WASM release detector — against a commit whose only content
  is a version number. That is not just waste: `Standalone packaged NIF lockfile`
  resolves `lumis_nif` from crates.io with `--locked`, so between the bump and
  the `cargo publish` that follows it, the version it now requires does not exist
  yet and the job fails. Nothing in the commit can fix that, and nothing should
  try. The publish is what makes the fix possible, and `rust-release.yml` runs it
  from there — see [Elixir package](#elixir-package).
- **`[skip ci]` is the wrong tool here.** It would suppress the runs entirely
  rather than showing them as skipped, but it keys on the same head commit that
  the package tag points at, so pushing `<package>/v<version>` would skip the
  publish workflow the release exists to trigger.

Tag-triggered workflows carry no such guard, and must not grow one.

One branch job is exempt: `crate-deps` in `rust.yml`. `mise run check-crate-deps`
reads manifests rather than the registry, so it passes on the bump commit, and
the bump commit is the only one that writes new `version` requirements — see
[Crate version requirements](#crate-version-requirements) for what shipped when
nothing checked them. Skipping it there would skip it exactly where it applies.

## Crate version requirements

A `version` requirement on a lumis crate must equal that crate's version in this
repository, spelled in full:

```toml
lumis-core = { path = "../lumis-core", version = "2.3.0", default-features = false }
```

Almost nothing built from this repository can tell you when that requirement
goes stale. Every crate that reaches a lumis crate through a `path` entry
resolves it there, and the root `[patch.crates-io]` table redirects the rest, so
local builds, CI, and the Elixir and Node addons compile against the working
tree no matter what the requirement says. `crates/autumnus` is the one exception:
it declares its own `[workspace]` and depends on `lumis` through the registry, so
its requirement is the only one a build here actually resolves.

For everything else the requirement takes effect only after the crate is on
crates.io, and even then only for consumers whose `Cargo.lock` already holds an
older version — a fresh resolve picks the newest match and looks fine.

That is how [#1118](https://github.com/leandrocp/lumis/issues/1118) shipped.
`lumis` 0.12.1 called `lumis_core::formatter::html::open_multi_themes_pre_tag`,
added in `lumis-core` 2.2.0, while requiring `lumis-core = "2"`. Anyone upgrading
from 0.11 kept the `lumis-core` 2.0.0 or 2.1.0 already in their lockfile and got
a compile error.

`mise run release-prepare` keeps this current, so a normal release needs no
manual edit. Writing the requirement in full is what makes that work: the
`cargo set-version` it already ran rewrites dependents only when the new version
falls outside their requirement, and `"2"` absorbed every 2.x bump silently.

```text
Upgrading lumis-core from 2.3.0 to 2.4.0
 Updating lumis's dependency from 2.3.0 to 2.4.0
 Updating lumis-cli's dependency from 2.3.0 to 2.4.0
 Updating lumis-js-native's dependency from 2.3.0 to 2.4.0
 Updating lumis-wasm-runtime's dependency from 2.3.0 to 2.4.0
```

`cargo set-version` only reaches dependents it can see through `path`.
`packages/elixir/lumis/native/lumis_nif/Cargo.toml` depends on `lumis-core`
through the registry, so `release-prepare` follows up with
`mise run check-crate-deps --fix`, which updates whatever is left:

```text
packages/elixir/lumis/native/lumis_nif/Cargo.toml: lumis-core 2.3.0 -> 2.4.0
```

Both passes edit manifests other than the one being released. Review everything
`git status` reports and commit it with the release, not just the target
package's `Cargo.toml` and `CHANGELOG.md`.

`mise run check-crate-deps` reports the same drift instead of fixing it. It runs
in `mise run lint`, as its own job in Rust CI, and again in `rust-release.yml`
before `cargo publish`.

`test-packaged-parsers` packages `lumis` and builds the extracted tarball, and
it resolves the sibling lumis crates to the tarballs built beside it rather than
to crates.io. Publish order releases `lumis-core`, `lumis-build` and
`lumis-wasm-runtime` before `lumis`, so a published `lumis` never meets an older
published `lumis-core`. Resolving from the registry tested that combination
anyway, which made the job fail for every change that adds core API and passes
it through `lumis` — a compile error nothing in the pull request could fix.
Packaging the set together keeps what the job is for, that the tarball builds
and its parsers work outside the workspace, and leaves requirement staleness to
`check-crate-deps`, which is the check that can actually see it.

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

The `npm-lumis` workflow also publishes all platform-specific `@lumis-sh/lumis-native-*` packages and then the `@lumis-sh/lumis-native` selector, before publishing `@lumis-sh/lumis` itself. All of them share the `npm-lumis` version and tag, and `mise run release-prepare npm-lumis <version>` bumps them together.

That lockstep is not cosmetic. `@lumis-sh/lumis` depends on the platform packages with `workspace:*`, which pnpm replaces with the workspace version when it packs, so a main package bumped on its own would ship optional dependencies pointing at the previous release — and npm refuses to republish a version that already exists, so the workflow would fail before reaching the main package. `mise run lint` runs `mise run check-native-versions`, which fails if any of them drift.

The `npm-cli` workflow builds the `lumis` binary for eight targets, publishes the `@lumis-sh/cli-*` platform packages, and then publishes `@lumis-sh/cli` itself. All of them share the `npm-cli` version and tag, and `mise run release-prepare npm-cli <version>` bumps them together, for the same reason the addon packages move in lockstep: `@lumis-sh/cli` pins them with `workspace:*`, which pnpm rewrites at pack time. `mise run lint` runs `mise run check-cli-versions`, which fails if any of them drift.

`npm-cli` no longer has to match `cargo-lumis-cli`. It used to, because the postinstall built its download URL out of its own npm version, so a version the crate had not released answered every install with a 404 — `@lumis-sh/cli` 0.5.0 shipped that way against `cargo-lumis-cli` 0.4.2 and stayed uninstallable for three weeks, then 0.6.0 repeated it against 0.5.0. Nothing in the repository resolves that URL, so nothing could see it. The binary now comes from npm, and the two version lines are independent.

Both musl targets build in a `rust:alpine` container, as the addon's do, because `tree-sitter` compiles wasmtime's C API through cmake and `rust:alpine` ships none. The CLI keeps musl's default static CRT, unlike the addon: it is an executable rather than something Node has to `dlopen`, so it needs neither `-crt-static` nor the `libgcc_s.so.1` that dropping it would pull in. The CLI and the addon therefore cover the same eight targets, and `scripts/test-shim.js` fails if one gains a target the other lacks.

If a JS release also needs new parser WASM packages, publish those first through the WASM workflow. Run `mise run wasm-publish-needed` to see which parser packages still need publishing.

Each `@lumis-sh/wasm-*` package contains its parser and matching processed
queries. During staging, `crates/dev` generates `lumis.json` from
`languages.toml`, the processed queries, and the built parser. It is a published
package artifact, not checked-in source. A parser revision or query change
publishes only the affected language package; it does not require runtime
package releases. `mise run wasm-publish-needed` compares the complete package
definition with the package's small `package.json#lumis` release marker.

Dynamic runtimes resolve every language package through the single compatible
range derived from the Tree-sitter series in `mise.toml` (for example `0.26`).
Do not release the runtimes after an ordinary `0.26.x` WASM release: new and
explicitly refreshed caches adopt it through npm/CDN range resolution. A move
to a new Tree-sitter minor series changes that range and does require releasing
the dynamic runtimes.

After changing language IDs, aliases, or parser package assignments in
`languages.toml`, run `mise run langs-gen-catalog` and
`pnpm --filter @lumis-sh/lumis run build:langs`, then commit the generated Rust
catalog data and JavaScript handles.

### Elixir package

Publish `hex-lumis` after the `cargo-lumis-core` and `cargo-lumis-wasm-runtime`
releases it requires. `packages/elixir/lumis/native/lumis_nif/Cargo.toml` reaches
both through the registry rather than through `path`, so
`packages/elixir/lumis/native/lumis_nif/Cargo.lock` can only be re-resolved once
those versions are on crates.io. Until it is, the packaged crate names versions
its lockfile does not pin, and a hex consumer building from source resolves
something nobody tested.

Nothing there is a step to remember. `mise run elixir-nif-lock-check --fix`
re-resolves the lockfile, and three places run it or check it:

- `rust-release.yml` runs the fix after each `cargo publish` and opens the
  `refresh-nif-lock` pull request. A release batch publishes one crate per tag,
  so the earlier tags run it while a crate the NIF also requires is still
  unpublished; the last tag in the batch is the one whose re-resolve succeeds.
  Merge that pull request before tagging `hex-lumis`.
- `mise run release-prepare hex-lumis` runs the same fix locally, so preparing
  the Hex release out of order fails on the missing crates.io version rather
  than shipping a stale lockfile.
- `elixir-release.yml` verifies it before the NIF build and the Hex publish. That
  runs on the tag, where no `chore(release):` guard can skip it, so a stale
  lockfile cannot reach Hex.

A red `Standalone packaged NIF lockfile` job on `main` means the refresh has not
landed yet. Merge the pull request, or run the fix locally and commit the result.

`elixir-release.yml` uploads the precompiled NIFs to a GitHub Release and syncs
the same files to Cloudflare R2 under `releases/download/<tag>`, served from
`https://artifacts.lumis.sh`. The R2 step fails the release if any of
`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` or `R2_BUCKET` is
missing, so the mirror cannot silently fall behind the GitHub Release.

Checksums are generated from GitHub, which `Lumis.Native.ArtifactURL` defaults
to. Changing that default would put checksum generation behind the R2 sync, so
leave it alone unless the ordering in the workflow changes too.

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

`npm-lumis` is the one exception: it additionally bumps `native/Cargo.toml`, the `@lumis-sh/lumis-native` selector, and all platform packages, because the release workflow publishes them under the same version before the main package. See [JavaScript packages](#javascript-packages).
