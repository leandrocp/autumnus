# Lumis Performance Benchmark Plan

<!-- markdownlint-disable MD013 -->

## Status

Implemented in this change. This file remains the design record; operational instructions live in [`benchmarks/README.md`](benchmarks/README.md).

The benchmark suite is intended to become a permanent development tool. Performance is a product goal, so the suite must be easy to run locally, difficult to misuse, and kept healthy in CI.

## Required comparisons

The first version will cover three comparison families using the same source bytes:

1. **Rust library:** Lumis versus `syntect`.
2. **JavaScript library:** Lumis JS versus Shiki.
3. **Installed CLI experience:** the npm-packaged Lumis command versus `bat`.

Every comparison that renders a document will use both:

- a realistic small Rust source file;
- a valid, varied, very large Rust source file.

Rust is the initial common language because all three competitors support it, Lumis has native and WASM Rust parsers, and it avoids injected-language behavior that would make the first baseline harder to interpret. More languages can be added after the benchmark contract is stable.

## Goals

- Measure fixed startup/initialization cost separately from repeated document rendering.
- Measure both latency-sensitive small documents and throughput-sensitive large documents.
- Track peak memory consumption as a secondary, best-effort metric when the host can measure it reliably.
- Include the CLI's real first-use behavior when its parser WASM is absent and must be downloaded.
- Include repeat-use CLI behavior when the parser asset and compilation cache are already warm.
- Compare shipped public workflows rather than private implementation shortcuts.
- Keep competitor dependencies out of production crates and packages.
- Produce native raw reports plus a concise common index with environment metadata.
- Support repeatable branch-to-branch and commit-to-commit comparisons.
- Build and smoke-test the benchmark system in normal CI so it cannot silently rot.
- Run the stable benchmark subset on a schedule and retain results for trend analysis.

## Non-goals for the first version

- Declaring a universal “fastest syntax highlighter” from one machine.
- Byte-for-byte output equivalence across Tree-sitter, TextMate, and syntect grammars.
- Benchmarking every supported language, formatter, theme, or JavaScript runtime.
- Measuring npm installation/postinstall time. The CLI benchmark measures the installed npm command shim plus its native binary.
- Using the network-inclusive CLI result as a regression gate.
- Treating memory as equally important as execution time or failing the suite when a platform cannot measure memory reliably.
- Adding more CLI competitors before the `bat` comparison is reliable. The design will make later adapters straightforward.
- Adding detailed allocation profiling or Iai-Callgrind in the initial implementation. Those are useful follow-ups after the wall-clock suite is trustworthy.

## Research basis

### Ghostty structure to adopt

Ghostty's benchmark system provides a useful structural model:

- It separates deterministic data generation from benchmark execution and explicitly warns not to mix generation into timing ([source](https://github.com/ghostty-org/ghostty/blob/53bd14fecfd68c6c0ab64d37b5943247299e2b40/src/benchmark/AGENTS.md#L3-L18)).
- It requires identical generated inputs and flags for branch comparisons, recommends repeated Hyperfine runs, and prohibits parallel benchmark execution on one machine ([source](https://github.com/ghostty-org/ghostty/blob/53bd14fecfd68c6c0ab64d37b5943247299e2b40/src/benchmark/AGENTS.md#L20-L30)).
- It treats benchmark tooling as first-class release-optimized build artifacts ([source](https://github.com/ghostty-org/ghostty/blob/53bd14fecfd68c6c0ab64d37b5943247299e2b40/src/build/GhosttyBench.zig#L16-L47)).
- Its harness excludes setup/teardown from the timed benchmark step ([source](https://github.com/ghostty-org/ghostty/blob/53bd14fecfd68c6c0ab64d37b5943247299e2b40/src/benchmark/Benchmark.zig#L28-L36)).
- Its required CI builds benchmark artifacts in release mode, preventing benchmark code from becoming stale ([source](https://github.com/ghostty-org/ghostty/blob/53bd14fecfd68c6c0ab64d37b5943247299e2b40/.github/workflows/test.yml#L150-L178)).

At the reviewed Ghostty revision, CI **builds** the benchmark binaries but does not appear to run a timing regression gate. Lumis should copy the first-class build/integrity idea and add a separate, carefully staged performance-run workflow.

### Tool-specific conclusions

- **Criterion.rs** is appropriate for warm Rust measurements because it performs warmup, sampling, confidence-interval analysis, and retained baseline comparisons.
- **Mitata** is appropriate for warm JavaScript measurements and supports machine-readable output. One JS runner should own both Lumis and Shiki cases so its sampling policy is identical.
- **Hyperfine** is appropriate for complete fresh-process and CLI commands, supports setup/prepare hooks, warmups, fixed runs, and JSON export.
- **syntect** requires syntax/theme assets to be loaded outside warm timing and a fresh per-document `HighlightLines` state inside timing.
- **Shiki** explicitly distinguishes expensive highlighter creation from synchronous rendering with a reused highlighter.
- **bat** must be run with user configuration, paging, decorations, auto-color, and language detection disabled or made explicit.

## Benchmark terminology

“Cold” and “hot” are too ambiguous to use as standalone result labels. The suite will use these explicit scenario names.

### Library scenarios

#### `library-first-render`

A fresh process performs the public package import/load path, initializes the required language/runtime/theme state, renders one document to themed HTML, consumes the result, and exits.

This includes fixed initialization plus one render. It is run for both small and large fixtures.

#### `library-warm-render`

Language/runtime/theme state is initialized before timing. Every measured iteration parses a fresh document and creates a fresh themed HTML result. The result is consumed with the runner's black-box mechanism.

This is the primary steady-state comparison and is run for both fixtures.

The suite must not call this “parse time”: it includes highlighting and HTML serialization.

#### `library-init`

Where the API exposes a meaningful initialization boundary, initialization is measured separately in a fresh child process.

For JavaScript, the child records module import, highlighter/language initialization, first render, and total elapsed time as distinct fields. External Hyperfine process time may also be retained, but independent medians must never be subtracted to manufacture a phase duration.

Rust does not need an artificial init-only result if the public Lumis API has no equivalent constructor. `library-first-render` remains the honest fresh-process metric.

### CLI scenarios

Every CLI measurement starts a new process. “Warm” therefore refers to assets/caches, not a reused CLI process.

#### `cli-first-use`

- The isolated Lumis data directory contains no Rust parser WASM.
- The isolated Wasmtime compilation cache is fresh, after implementation verifies how Wasmtime 36 resolves its cache configuration.
- Lumis automatically downloads the parser WASM, compiles/loads it, parses, renders ANSI, writes to the same output sink as competitors, and exits.

This is real user-experience evidence, but the network/CDN dominates its variance. It will use only a few samples, record download metadata, and remain non-gating.

`bat` can be displayed beside this result for user context, but the report must not present a download-inclusive Lumis/`bat` ratio as a pure engine comparison.

#### `cli-repeat-use`

- The parser WASM already exists in the isolated Lumis data directory.
- The Wasmtime compilation cache is prewarmed.
- Each sample still launches the npm shim and native Lumis process from scratch.

This is the primary stable CLI comparison against `bat` and is run for both fixtures.

#### `cli-native-repeat-use` (diagnostic)

The same repeat-use case invokes `target/release/lumis` directly. It is reported separately to show npm Node-shim overhead. The npm shim remains the primary Lumis CLI result.

## Benchmark matrix

| Family | Scenario | Implementations | Small | Large | Primary use |
| --- | --- | --- | ---: | ---: | --- |
| Rust | `library-first-render` | Lumis, syntect | yes | yes | startup plus first document |
| Rust | `library-warm-render` | Lumis, syntect | yes | yes | steady parse/highlight/HTML render |
| JS | `library-init` | Lumis JS, Shiki | n/a | n/a | import and runtime/language initialization |
| JS | `library-first-render` | Lumis JS, Shiki | yes | yes | startup plus first document |
| JS | `library-warm-render` | Lumis JS, Shiki | yes | yes | steady parse/highlight/HTML render |
| CLI | `cli-first-use` | npm Lumis, bat context | yes | yes | real cache-miss/download experience |
| CLI | `cli-repeat-use` | npm Lumis, bat | yes | yes | stable installed-command comparison |
| CLI | `cli-native-repeat-use` | native Lumis | yes | yes | npm shim overhead diagnosis |

## Fairness contract

### Shared inputs

- All engines receive exactly the same UTF-8 bytes.
- The language is explicitly `rust`; auto-detection is excluded.
- Line endings are fixed to LF and recorded.
- Source loading is outside warm in-process timing.
- Fresh-process and CLI cases include source-file reading equally for all implementations.

### Comparable output work

- Rust and JS library comparisons render themed inline HTML through public APIs.
- CLI comparisons render ANSI terminal output.
- Themes are explicit, dark, and pinned. Theme names and scope maps are not expected to be identical across ecosystems.
- Output is consumed in every timed case.
- Preflight validation records output byte counts and checks for expected HTML/ANSI structure.
- Different output lengths are reported because they affect allocation and serialization work.

The outputs are semantically comparable, not byte-equivalent. The summary must state that Tree-sitter queries, TextMate grammars, syntect syntaxes, token boundaries, theme rules, and wrappers differ.

### Warm-state rules

For Rust warm cases:

- preload Lumis lazy language/theme configuration before Criterion timing;
- preload syntect `SyntaxSet` and `ThemeSet` before timing;
- create fresh per-document formatter/parser state and output allocation inside every iteration;
- preserve syntect line state across the complete document and use its newline-preserving line iterator;
- black-box both input and output.

For JavaScript warm cases:

- use Node as the only initial runtime;
- create one Lumis highlighter and one Shiki highlighter before Mitata timing;
- preload exactly Rust plus one theme for each;
- resolve Lumis's parser WASM from a pinned local npm dependency, never a CDN;
- select and record Shiki's engine explicitly;
- create normal per-call options/formatter objects inside each measured document render;
- disable concurrent benchmark cases.

### CLI rules

Lumis:

- execute a staged copy of the real `packages/javascript/cli/bin/lumis` shim with the current release-built native binary under its expected `vendor/` path;
- state clearly that this reproduces installed-command invocation, not npm installation;
- set isolated `LUMIS_DATA_DIR`, config, HOME/XDG, and Wasmtime cache paths;
- set explicit formatter, Rust language, and theme;
- validate cache miss/hit behavior in an untimed preflight.

`bat`:

- use `--no-config`;
- use `--paging=never`;
- use `--style=plain`;
- use `--color=always`;
- use an explicit Rust language and explicit theme;
- clear or override `BAT_OPTS`, pager, and color-related environment variables.

Hyperfine will use direct command execution where supported and send every command's stdout to the same sink. Preparation and cache mutation run outside timed regions.

## Fixtures

### Small fixture

`benchmarks/fixtures/rust-small.rs` will be checked in and contain roughly 1–2 KiB of realistic Rust:

- imports and a small data type;
- generics and an `impl`;
- comments and strings requiring escaping;
- control flow, iterator calls, and a macro;
- enough lines to be realistic without hiding startup cost.

### Large fixture

The large fixture will be generated outside the repository into `target/benchmarks/fixtures/rust-large.rs`.

Requirements:

- at least 1 MiB and tens of thousands of lines;
- syntactically valid standalone Rust;
- deterministic fixed seed/configuration;
- varied modules, identifiers, literals, comments, strings, generics, matches, macros, and nesting;
- not a single snippet repeated unchanged;
- no external crate dependency;
- generated before timing and reused unchanged across all cases and compared revisions.

The final target size should be selected after a pilot confirms that a complete local development run remains practical. The minimum remains 1 MiB.

### Fixture manifest and validation

`benchmarks/fixtures/manifest.json` will record:

- fixture ID and language;
- generator schema/version and seed;
- expected SHA-256;
- byte count and line count;
- encoding and line ending;
- minimum/maximum accepted size.

`just bench-fixtures` will generate and verify fixtures. Validation will include:

- deterministic hash reproduction;
- size and line-count checks;
- Rust parse/compile validity for the generated source;
- one untimed render through every adapter;
- non-empty, structurally valid output.

Generation is never part of a benchmark measurement.

## Proposed repository structure

```text
benchmarks/
├── AGENTS.md                         # benchmark-specific invariants
├── README.md                         # commands, scenarios, interpretation
├── mise.toml                         # pinned tools, environment, task graph
├── fixtures/
│   ├── manifest.json
│   ├── rust-small.rs
│   └── templates/                    # varied deterministic large fixture source
├── scripts/
│   ├── generate-fixtures.mjs
│   ├── verify-fixtures.mjs
│   ├── collect-metadata.mjs
│   ├── measure-memory.mjs
│   ├── prepare-cli-cache.mjs
│   └── summarize.mjs
├── rust/
│   ├── Cargo.toml                    # standalone benchmark workspace/package
│   ├── Cargo.lock                    # pins Criterion and syntect
│   ├── benches/render.rs             # Criterion warm-render matrix
│   └── src/bin/
│       ├── lumis-first-render.rs     # fresh-process Lumis helper
│       └── syntect-first-render.rs   # fresh-process syntect helper
├── javascript/
│   ├── package.json                  # private pnpm workspace package
│   └── src/
│       ├── warm-render.mjs           # Mitata Lumis/Shiki matrix
│       ├── first-render-lumis.mjs    # fresh child with internal phases
│       ├── first-render-shiki.mjs
│       └── run-first-render.mjs      # parent sampler/collector
└── cli/
    └── cases.mjs                     # declarative npm Lumis/native/bat commands
```

Generated fixtures, staged binaries/packages, caches, and result reports live under `target/benchmarks/` and remain untracked.

### Package boundaries

- `benchmarks/rust` will be a standalone Cargo workspace/package, not a member of the production root workspace. This prevents ordinary `cargo test --workspace` and `cargo clippy --workspace --all-targets` from compiling Criterion and syntect.
- Its Lumis dependency will use a path and `default-features = false` with only the Rust language feature.
- The benchmark crate will copy the production release/bench optimization intent, including LTO and one codegen unit where appropriate.
- `benchmarks/javascript` will be private and join `pnpm-workspace.yaml` so it can depend on the local `@lumis-sh/lumis` and theme packages while pinning Shiki, Mitata, and the Rust WASM package in `pnpm-lock.yaml`.
- No competitor dependency enters a published Lumis manifest.

## Tooling

### Rust

Criterion owns `library-warm-render` and reports:

- time per document;
- bytes per second;
- sample/iteration details;
- confidence intervals and outliers;
- native Criterion HTML/data output.

Separate release binaries own `library-first-render` so each process links only the implementation it measures. Hyperfine launches those helpers with the small and large fixture paths.

### JavaScript

Mitata owns `library-warm-render` and emits its native JSON result.

Fresh-process JS uses a parent/child harness rather than pretending a warmed benchmark runner can measure startup:

1. parent launches a new Node process per sample;
2. child starts a monotonic clock immediately;
3. child dynamically imports only its assigned engine;
4. child initializes exactly Rust plus one theme/runtime;
5. child renders one fixture;
6. child emits import, initialization, render, and internal total durations plus output bytes;
7. parent records external process duration separately.

No phase is calculated by subtracting medians from unrelated commands.

### CLI

Hyperfine owns complete CLI command measurements and exports JSON.

The first-use prepare hook removes only isolated benchmark parser and compilation caches. The repeat-use setup performs an untimed fetch/render to seed both, verifies the parser file exists, and then uses the same immutable cache snapshot for every measured implementation/fixture pair.

The implementation phase must verify Wasmtime 36's effective cache paths before claiming compilation-cache isolation.

### Memory consumption (secondary)

Memory will be measured in a separate pass so instrumentation cannot distort the primary timing samples.

The preferred common metric is **peak resident set size (peak RSS)** for the complete scenario process:

- on Linux, use GNU `/usr/bin/time -v` or an equivalent process sampler;
- on macOS, use `/usr/bin/time -l` or an equivalent process sampler;
- for Node helpers, also record `process.resourceUsage().maxRSS` and `process.memoryUsage()` snapshots after import, initialization, and render;
- for the npm CLI, measure the installed shim command as a process tree when the platform tool includes child usage, and retain native CLI memory as a diagnostic.

Memory cases use the same small/large fixtures, cache scenarios, commands, and output validation as timing cases. Reports must record the measurement source, whether child-process memory is included, units, and platform semantics. Peak RSS from different operating systems is not directly comparable.

Memory is informational in v1: no forced GC, no cross-platform regression gate, and no failure when a supported measurement source is unavailable. The report records `memory_supported: false` and continues. After calibration on stable Linux CI, broad memory budgets may be added per workload.

### Optional later instrumentation

After the core suite is stable:

- Iai-Callgrind can provide deterministic Rust instruction/cache-event regression signals on Linux.
- Detailed allocation measurement can be added for Rust and JavaScript.
- Rust/JS token-event-only diagnostics can help localize regressions, but must remain secondary because engines expose different token models.

## Mise workflow with just compatibility

`benchmarks/mise.toml` is the benchmark control plane: it pins tools, defines shared environment variables, models task dependencies and incremental sources/outputs, and is consumed by `jdx/mise-action` in CI. Root `just bench-*` recipes remain thin compatibility wrappers during the repository-wide migration.

Equivalent compatibility recipes:

```text
just bench-setup
    Check/install guidance for Hyperfine and bat, install locked dependencies,
    generate fixtures, and build/stage required artifacts.

just bench-check
    Verify fixture determinism, build every benchmark target without timing,
    lint benchmark code, and run adapter/output preflights.

just bench-smoke
    Run one short small-fixture sample through every offline adapter.

just bench-dev
    Run a shortened, stable, offline suite:
    Rust warm/first render, JS warm/first render, CLI repeat-use.

just bench
    Run the complete requested suite, including the network-dependent
    CLI first-use cases, attempt the secondary memory pass, and write a
    summary plus raw reports.

just bench-rust
just bench-js
just bench-cli scenario="repeat-use"
just bench-cli-first-use
    Focused family/scenario entry points.

just bench-memory
    Run the secondary peak-memory pass where the host supports it.

just bench-stage label
    Build and preserve immutable benchmark artifacts for the current revision.

just bench-compare left right
    Compare two staged revisions using one fixture snapshot and serial execution.
```

`just bench` must print a clear warning before network/cache-miss measurements and only remove benchmark-owned directories.

No benchmark family may run concurrently with another on the same host. Parallel compilation is fine; timed execution is serial.

## Results and interpretation

Each run writes to an immutable directory such as:

```text
target/benchmarks/runs/<run-id>/
├── metadata.json
├── fixtures.json
├── criterion/...
├── js-warm.json
├── js-first-render.json
├── rust-first-render.json
├── cli-repeat-use.json
├── cli-first-use.json
├── memory.json
├── summary.json
└── summary.md
```

### Metadata

At minimum:

- git commit, branch, and dirty state;
- fixture hashes, bytes, and lines;
- Cargo.lock and pnpm-lock hashes;
- Lumis, syntect, Shiki, bat, Criterion, Mitata, Hyperfine, Node, Rust, and pnpm versions;
- Shiki engine and theme IDs;
- Lumis parser WASM URL, resolved response metadata when available, and downloaded SHA-256;
- OS, kernel, architecture, CPU model, logical/physical cores, and memory;
- power/virtualization information when available;
- exact commands, scenario, warmups, samples, and timing units;
- output byte counts;
- cache paths and cache preparation state;
- when supported, peak RSS, phase memory snapshots, measurement source, units, process-tree coverage, and platform semantics.

### Summary policy

- Preserve every tool's native report unchanged.
- The common summary is an index, not a replacement statistical model.
- Show median/central estimate, uncertainty/dispersion supplied by the native tool, throughput, output bytes, and Lumis/competitor ratio within the same workload.
- Never collapse Criterion, Mitata, and Hyperfine into one synthetic score.
- Never compare results from different fixture hashes or materially different environments without a warning.
- Mark network-inclusive results as `non_gating: true`.
- Keep memory results in a separate secondary section, mark unavailable measurements explicitly, and never compare incompatible OS measurement semantics.
- Prefer branch-to-branch measurements on one host over comparing numbers copied from unrelated machines.

## Branch comparison

Following Ghostty's approach, branch comparisons must reuse one generated fixture snapshot and preserve built artifacts under labels.

The initial implementation should support:

1. stage `main` artifacts;
2. switch revision/worktree;
3. stage candidate artifacts;
4. verify fixture and dependency compatibility;
5. run benchmark cases serially, interleaving candidates where the tool permits;
6. report absolute estimates and candidate-versus-base deltas.

The comparison must refuse or prominently warn when fixture hashes, competitor versions, runtime versions, output mode, or cache scenarios differ.

## CI design

Performance CI is observational and runs on every pull request as one non-gating stable suite:

- Rust first/warm render;
- JS init/first/warm render;
- CLI repeat-use and native diagnostic;
- a separate informational peak-memory pass when supported.

The job publishes available `summary.md` tables to the GitHub job summary and retains raw artifacts for seven days. It does not run the network-dependent first-use scenario, formatting, linting, repository-cleanliness, or other integrity checks. There are no scheduled runs.

### 1. Regression rollout

Do not invent thresholds before observing the suite.

1. Collect at least 10–20 comparable pull-request runs on the intended runner.
2. Quantify per-case variance and identify unstable cases.
3. Prefer comparator-normalized ratios because syntect, Shiki, and bat run in the same job with pinned versions.
4. Set a practical regression budget per stable case, not one global percentage.
5. Require confirmation/retry before failing on a wall-clock regression.
6. Keep network results and known-unstable cases informational.
7. If reliable gating is a hard requirement, move timing jobs to a stable dedicated/self-hosted runner; hosted-runner results can continue as warnings.

A later base-versus-head CI mode can build both revisions in separate worktrees, reuse one fixture snapshot, and compare them on the same runner. This is preferable to comparing a pull request against historical results from different machines.

### 2. Historical presentation

The first implementation should retain workflow artifacts and job summaries without committing machine-specific result files. After calibration, evaluate Bencher or another trend store against the normalized schema. External service adoption is not required to make the benchmark suite useful locally or to keep it healthy in CI.

## Implementation phases

### Phase 1 — Contract, documentation, and fixture generator

- Add `benchmarks/AGENTS.md` with the fairness, deterministic input, serial execution, release-build, and cache-safety rules.
- Add `benchmarks/README.md` describing scenarios and result interpretation.
- Add the small fixture, varied large-fixture templates/generator, and manifest.
- Add fixture generation and validation recipes.
- Update `ARCHITECTURE.md` with the benchmark lane.
- Update `CONTRIBUTING.md` with setup and `just bench*` entry points.

### Phase 2 — Rust comparison

- Create the standalone benchmark Cargo package and lockfile.
- Add Criterion warm-render groups for Lumis and syntect, small and large.
- Add separate fresh-process binaries for first-render cases.
- Validate output structure/size before timing.
- Export native and indexed results.

### Phase 3 — JavaScript comparison

- Add the private pnpm benchmark package with pinned Shiki, Mitata, and local Rust WASM dependencies.
- Build/import the local shipped Lumis package, not TypeScript source internals.
- Add warm Lumis/Shiki render cases.
- Add fresh child-process phase timing for import, initialization, and first render.
- Export native and indexed results.

### Phase 4 — CLI comparison and cache states

- Build the production release CLI with the root release profile.
- Stage the real npm shim around that binary under `target/benchmarks/`.
- Add `bat` with controlled flags/environment.
- Implement and verify isolated first-use and repeat-use parser/Wasmtime cache preparation.
- Record parser URL/hash and output sizes.
- Add npm shim primary results and direct-native diagnostics.

### Phase 5 — Orchestration and reports

- Add the complete mise task graph and thin `just bench*` compatibility wrappers.
- Collect environment and dependency metadata.
- Add a separate best-effort peak-RSS pass and Node phase memory snapshots.
- Preserve native reports and generate `summary.json`/`summary.md`.
- Add staged-revision and comparison support.
- Ensure failures are actionable: missing tools, wrong fixture hash, network unavailable, cache not in expected state, or invalid output.

### Phase 6 — CI

- Add one non-gating stable offline benchmark suite and artifact upload on every pull request.
- Keep the network-dependent first-use scenario local-only.
- Collect variance before enabling regression thresholds.
- Document the threshold calibration and rerun policy.

### Phase 7 — Pilot and calibration

- Run the complete suite on Linux and macOS.
- Confirm the large fixture is large enough to reveal throughput without making the developer loop impractical.
- Tune warmup, sample count, and measurement duration per family.
- Measure runner variance and establish initial comparator-normalized budgets.
- Record known limitations in `benchmarks/README.md`.

## Acceptance criteria

The implementation is complete when:

- `just bench` runs all required Rust, JS, and CLI comparisons on small and large fixtures.
- `just bench-dev` provides a practical stable offline loop for everyday development.
- `just bench-check` and `just bench-smoke` run in CI.
- The large fixture is deterministic, valid Rust, at least 1 MiB, and generated outside timed work.
- All adapters consume identical fixture hashes and explicit language/output settings.
- Rust and JS initialization is not accidentally included in warm-render cases.
- JS fresh-process reports contain directly measured import, initialization, render, and total phases.
- CLI first-use proves the parser asset was absent before and present after automatic download.
- CLI repeat-use proves parser and compilation caches were seeded before timing.
- The npm shim is the primary CLI result and native CLI is clearly diagnostic.
- Network-inclusive results are clearly non-gating.
- Raw Criterion, Mitata, Hyperfine, and phase-harness data is retained.
- Supported hosts produce a separate memory report with peak RSS for each implementation and fixture; unsupported hosts report the metric as unavailable without failing.
- Every report records source, dependency, toolchain, fixture, output-size, host, and cache metadata.
- Every pull request runs one non-gating stable benchmark suite.
- CI publishes a readable summary and retains its benchmark artifact for seven days.
- `CONTRIBUTING.md` and `ARCHITECTURE.md` describe the actual implemented workflow.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| CDN latency dominates CLI first-use | Few samples, record download metadata, never gate on it |
| Wasmtime cache is not actually isolated | Verify effective cache config/path before implementation; fail preflight if state is uncertain |
| Hosted CI hardware is noisy | Start observational, run serially, use pinned image, normalize against same-job competitors, prefer dedicated runner for gates |
| Different grammars/themes produce different work | Fix public output class, record output bytes, state semantic-not-byte equivalence |
| Synthetic large source favors one engine | Generate varied valid constructs, pilot with real samples later, avoid unchanged repetition |
| Benchmark dependencies slow normal workflows | Standalone Cargo package and private JS benchmark package; no production dependencies |
| JIT/GC distorts JS | One runtime, explicit warmup, serial cases, raw distributions, initialization outside warm timing |
| Peak RSS semantics differ by OS/tool | Keep memory secondary, record the source and process-tree coverage, compare only compatible measurements |
| Memory instrumentation distorts timing | Run memory collection separately from all primary timing samples |
| CLI npm wrapper staging diverges from published package | Copy the actual tracked shim and expected vendor layout; validate it with the current binary |
| Baselines compare incompatible runs | Refuse/warn on fixture, toolchain, dependency, output-mode, or cache-scenario mismatch |
| Benchmark code silently breaks | Required CI build/check/smoke job |

## Recommended v1 decisions

- One shared language: Rust.
- Two shared document sizes: approximately 1–2 KiB and at least 1 MiB.
- Library output: themed inline HTML.
- CLI output: ANSI with explicit theme/language and no UI decorations.
- Rust runner: Criterion plus Hyperfine fresh-process helpers.
- JS runner: Mitata plus a custom fresh-child phase collector.
- CLI runner: Hyperfine.
- Secondary memory metric: separate best-effort peak RSS, with Node phase snapshots where available.
- CLI competitors: `bat` only in v1; native Lumis is diagnostic rather than a competitor.
- CI: one stable offline benchmark suite runs on every pull request as a non-gating observation; network first-use remains local-only, and timing regression gates require explicit future calibration and approval.
