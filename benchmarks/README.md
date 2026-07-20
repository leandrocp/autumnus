# Lumis benchmarks

<!-- markdownlint-disable MD013 -->

This directory contains Lumis's permanent cross-runtime performance suite. It compares:

- the Rust `lumis` crate with `syntect`;
- `@lumis-sh/lumis` with Shiki on Node;
- Lumis through its Rust, JavaScript/native, and Elixir/NIF library APIs;
- the installed `@lumis-sh/cli` command with `bat`;
- the npm CLI shim with the native Lumis binary as a diagnostic.

The suite measures a shared small Rust fixture and a deterministic generated Rust fixture larger than 1 MiB. Fixture generation is never timed.

## Install

The benchmark environment is pinned in [`benchmarks/mise.toml`](mise.toml), with cross-platform download metadata in [`benchmarks/mise.lock`](mise.lock). Install [mise](https://mise.jdx.dev/getting-started.html), trust the project config once, and let mise install Node, pnpm, Rust, Hyperfine, and bat:

```sh
mise trust benchmarks/mise.toml
mise install -C benchmarks
mise run -C benchmarks setup
```

The transitional root entry point is equivalent:

```sh
mise run bench-setup
```

Benchmark-only Rust dependencies live in an independent workspace under `benchmarks/rust/`. JavaScript competitors live in the private `@lumis-sh/benchmarks` workspace package. They are not dependencies of published Lumis packages.

## Commands

Mise is the benchmark control plane. Root `mise run bench-*` tasks are thin wrappers around the focused tasks in `benchmarks/mise.toml`.

```sh
mise run -C benchmarks smoke            # short, offline integration run
mise run -C benchmarks dev              # shortened stable development suite
mise run -C benchmarks full             # complete suite, including downloads
mise run -C benchmarks rust full        # Rust warm and first-render cases
mise run -C benchmarks javascript       # Lumis JS versus Shiki
mise run -C benchmarks application      # six-way app-like library workload
mise run -C benchmarks cli repeat-use   # npm/native Lumis versus bat
mise run -C benchmarks cli:first-use    # cache miss and WASM download
mise run -C benchmarks memory           # secondary peak-RSS pass
mise run -C benchmarks check            # build, format, lint, preflight
```

`mise tasks ls -C benchmarks` lists every focused task. Mise owns tool versions, task dependencies, incremental `sources`/`outputs`, and shared benchmark environment variables. Timed composite tasks still execute benchmark families serially.

`mise run -C benchmarks full` removes only `target/benchmarks/runs/current` and benchmark-owned cache directories. The first-use CLI benchmark intentionally performs repeated network downloads and prints a warning first.

Useful environment controls:

| Variable | Purpose | Default |
| --- | --- | --- |
| `BENCH_FIXTURE` | `small`, `large`, or `all` | `all` |
| `BENCH_RUNS` | Hyperfine run/minimum-run count | scenario-specific |
| `BENCH_WARMUP` | Hyperfine warmup count | scenario-specific |
| `BENCH_SAMPLES` | Minimum Mitata observations and Criterion statistical samples | `20` |
| `BENCH_TIME_SECONDS` | Application runner measurement target per case | `2` |
| `BENCH_WARMUP_SECONDS` | Criterion/Benchee warmup duration per case | `1` |
| `BENCH_JS_SAMPLES` | Mitata samples per warm case | `5` |
| `BENCH_RUN_DIR` | Result directory | `target/benchmarks/runs/current` |

Timed benchmark families run serially. Do not run multiple suites concurrently on the same machine.

## Scenarios

### Library first render

A new process reads one fixture, imports or initializes one implementation, renders themed inline HTML, consumes the output, and exits.

JavaScript children report import, initialization, render, internal total, external process total, output bytes, and memory snapshots separately. Rust helpers report read, initialization, render, and internal total phases. Hyperfine supplies complete Rust process timing.

### Library warm render

Language, runtime, syntax, and theme state is initialized before timing. Each sample parses a fresh document and creates a new HTML output.

- Criterion measures Rust Lumis and syntect.
- Mitata measures Lumis JS and Shiki.

These are parse, highlight, and HTML serialization measurements—not parser-only measurements.

### Cross-runtime application workload

Each benchmark initializes JavaScript and JSON, then highlights three realistic small snippets in each language. The same versioned fixture bytes are consumed by Lumis Rust, Lumis JavaScript/native, Lumis JavaScript/Wasm, Lumis Elixir/NIF, Shiki, and syntect. This models a common website or application render more closely than either a single-snippet cold start or repeated rendering of one large file.

Each host runtime owns its measurements: Criterion runs Lumis Rust and syntect, Mitata runs the three JavaScript implementations, and Benchee runs Lumis Elixir. `mise` invokes those harnesses serially, preserves their native JSON reports, and then merges comparable medians and workload metadata into `application.json`.

Every measured invocation follows one validated execution contract:

- **Init/load:** initialize the library while requesting JavaScript and JSON through its public API. No synthetic highlights are used.
- **Render 6:** using a prepared runtime, highlight the same three JavaScript and three JSON fixture strings exactly once each.
- **Total:** perform init/load followed by render 6, for exactly six highlight calls and the same 1,036 input bytes in every implementation.

Fixture parsing, module imports, output validation, and report serialization are outside the timed operation. Validation metadata records the requested language count, highlight counts, input bytes, output bytes, language order, and language-loading scope; merging fails if the execution contracts differ. Syntect's public bundled-default API loads its complete default syntax and theme sets before highlighting the six fixtures, so its report explicitly records `bundled-defaults`. That is retained as a library limitation rather than hidden or approximated.

Runner sample counts are deliberately absent from the comparison table because they are not the same statistical unit. Criterion samples are aggregates over multiple iterations, Mitata observations may be time-budgeted single invocations, and Benchee collects as many invocations as fit its measurement duration. Every observation still executes the same six-highlight operation; runners repeat that operation as needed for their statistical model. Raw reports retain sample counts, iterations, dispersion, and confidence data. Default application runs request a two-second measurement target per case, with at least 20 Mitata observations and 20 Criterion statistical samples; runner-native warmup, batching, and garbage-collection policies may extend collection.

The common report is an index, not a replacement statistical model. Sample collection, warmup, outlier behavior, and confidence calculations remain those of Criterion, Mitata, or Benchee. Implementations use the same `github-dark` theme intent where available and inline HTML output.
Initialization, rendering, and total workload are independent benchmark cases, so their medians are not expected to add up exactly. The combined workload is the primary app-like comparison.

### CLI repeat use

Every sample starts a new process, but the Rust parser WASM and Wasmtime cache are prepared first. The npm shim result is the primary Lumis CLI measurement; the direct native binary isolates Node-shim overhead.

`bat` runs with explicit Rust language/theme, no configuration, no pager, plain decorations, and forced color.

### CLI first use

The isolated Lumis data and compilation-cache directories are removed before each Lumis run. The command automatically downloads the Rust parser WASM before highlighting.

This result includes CDN/network behavior and is informational. It must never gate a pull request or release.

### Memory

Memory runs separately from timing. On Linux and macOS, `/usr/bin/time` records peak resident set size for fresh processes. Node first-render helpers also record `process.resourceUsage().maxRSS` and phase snapshots.

Memory is secondary and informational. Reports include the platform measurement source and process-tree caveat. Unsupported hosts write `memorySupported: false` instead of failing.

## Fixtures

`benchmarks/fixtures/manifest.json` pins encoding, line endings, minimum sizes, line counts, generator configuration, and SHA-256 values.

```sh
mise run bench-fixtures
```

This command:

1. deterministically generates `target/benchmarks/fixtures/rust-large.rs`;
2. verifies both fixture hashes and sizes;
3. rejects CRLF input;
4. compiles each fixture with `rustc` as an untimed validity check.

The large input is varied valid Rust rather than one repeated snippet.

## Results

Current-run artifacts are written under `target/benchmarks/runs/current/`:

```text
metadata.json
criterion/
js-warm.json
js-first-render.json
application.json
application/
  benchee.json
  criterion/application/**/new/*.json
  lumis-elixir-metadata.json
  lumis-js-native.json
  lumis-js-wasm.json
  lumis-rust-metadata.json
  shiki.json
  syntect-metadata.json
rust-first-render-*.json
cli-repeat-use-*.json
cli-first-use-*.json
memory.json
summary.json
summary.md
```

Native runner reports are preserved. `summary.json` and `summary.md` are indexes; they do not pretend Criterion, Mitata, Benchee, and Hyperfine use identical statistics.

Compare only runs with compatible fixture hashes, dependency versions, runtime versions, output modes, operating systems, and cache scenarios. Different highlighters use different grammars, token boundaries, theme rules, and output sizes, so results are semantically comparable rather than byte-equivalent.

## Comparing revisions

After a run, preserve its reports and optimized artifacts:

```sh
mise run bench-stage main
# switch branch or worktree, rerun the suite
mise run bench-stage candidate
mise run bench-compare main candidate
```

Labels accept letters, numbers, `.`, `_`, and `-`. Comparison output is stored under `target/benchmarks/staged/`.

For the strongest comparison, build and run both revisions on the same idle host with one fixture snapshot. Do not compare copied numbers from unrelated machines.

## CI policy

CI uses [`jdx/mise-action`](https://github.com/jdx/mise-action) with `benchmarks/mise.toml`, so local and CI tool versions are identical.

Every pull request runs one observational, non-gating stable benchmark suite. It covers Rust and JavaScript first/warm rendering, CLI repeat use, and the secondary memory pass. The job publishes available value tables to the GitHub Actions job summary and retains `lumis-benchmarks-<sha>` artifacts for seven days.

CI does not run the network-dependent first-use scenario, formatting, linting, or repository integrity checks. There are no scheduled benchmark runs or regression thresholds.
