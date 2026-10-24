# Optional theme packs: Elixir proof of concept

This experiment checks whether adding a theme dependency can make its names
available to Lumis, MDEx and direct `mdex_native` calls without rebuilding either
NIF. It does not change production packages or the website's theme catalog.

Run from the repository root on Linux, with Rust, Elixir, Erlang, Git and jq installed:

```sh
mise run poc-theme-packs
```

The first run downloads pinned source snapshots and Hex dependencies, then builds
two debug NIFs. Later runs reuse them. Everything runs under the ignored
`tmp/theme-packs-poc/` directory; the runner refuses an unexpected source revision
or a patch conflict rather than resetting that directory.

## Packages

| Package | Included themes | Dependency |
| --- | --- | --- |
| `lumis_themes` | `onedark`, `catppuccin_latte` (MIT) | Transitive default of both Lumis and mdex_native |
| `lumis_themes_copyleft` | `ayu_dark` (GPL-3.0) | Explicit consumer choice |

Each staged pack includes the upstream license texts and a notice linking to the
recorded source revisions. These are local path packages, not published Hex
packages or a legal certification of the final distribution.

The consumer adds the optional dependency with:

```elixir
{:lumis_themes_copyleft, path: "../themes-copyleft"}
```

Existing formatter options still select the theme by name:

```elixir
MDEx.to_html!("```rust\nfn main() {}\n```",
  syntax_highlight: [
    engine: :lumis,
    opts: [formatter: {:html_inline, theme: "ayu_dark"}]
  ]
)
```

The production acceptance criterion is dependency-only installation: permissive
themes keep working on upgrade, and optional themes need only the extra package.
Neither path may require registration calls, directory configuration, feature
flags or manual native builds. Moving copyleft themes out of the default pack
does not, by itself, require a major release for this project.

## What changes in the snapshots

The patches replace the embedded catalog with a file-backed catalog using the
existing JSON decoder. The default pack discovers both packs on the OTP code
path. Each application's bootstrap passes those directories to its own NIF before
highlighting starts. Both NIFs read the same files, but have independent native
catalogs. No Elixir lookup interception or MDEx theme-option rewriting is needed.

`packs.rs` supplies the shared catalog; `lumis.patch` and `mdex_native.patch`
connect it to the two applications. MDEx itself is unmodified. The native patch
also aligns the local Tree-sitter source with Lumis. Both resolved lockfiles use
Wasmtime 48.0.7. Debug mode is forced only in these snapshots.

## Checks

The runner executes these scenarios in separate BEAM processes:

1. MDEx and direct native calls with the default pack, without `:lumis` installed.
2. The same calls after adding the copyleft dependency.
3. The default-only scenario again, checking that the optional pack does not leak.
4. Both NIFs loaded, with the default pack only.
5. Both NIFs loaded, with both packs.

Assertions check actual theme colors, theme enumeration, raw-name options,
multi-theme options, and fenced-block overrides. Missing optional themes retain
the existing entry point's behavior: single-theme rendering falls back, while an
unknown multi-theme option raises. The tests also assert that `dracula`, which is
not in either sample pack, is unavailable rather than silently embedded.

SHA-256 hashes and modification times of the built native libraries must remain
unchanged when the dependency is added, for both the MDEx-only and two-NIF cases.

## Not covered

This proves the Elixir integration path, not the complete cross-runtime split.
It does not implement Rust, CLI, Java or JavaScript theme packages, repartition
the full catalog, update releases, or exercise `mix release`. Configuration is
immutable for a running VM; changing installed packs requires a restart.

The final design still needs license review, a policy for unlicensed themes,
cross-runtime packaging, and catalog metadata that lets the website list all
themes while identifying the package each requires.
