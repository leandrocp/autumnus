# Benchmark operating rules

<!-- markdownlint-disable MD013 -->

These rules apply to everything under `benchmarks/`.

- Generate fixtures before timing. Fixture generation is never benchmarked.
- Reuse the exact same fixture bytes across implementations and revisions.
- Validate fixture SHA-256 values before every benchmark run.
- Build benchmarked code with optimized release/bench profiles.
- Run timed benchmark families serially. Parallel compilation is allowed; parallel timing is not.
- Keep language, theme intent, formatter, cache state, and output sink explicit.
- Keep initialization outside warm-render timing.
- Consume and validate every rendered output.
- Preserve native runner reports. The common summary is an index, not a replacement statistical model.
- Treat CLI parser-download results and memory results as informational and non-gating.
- Only remove benchmark-owned files under `target/benchmarks/`.
- Record toolchain, dependency, fixture, host, output-size, and cache metadata with every run.
- Do not add competitor dependencies to published Lumis packages.
- Define benchmark tools, environment, dependencies, and workflows in `benchmarks/mise.toml`.
- Keep root `mise run bench-*` tasks as thin wrappers around `benchmarks/mise.toml`.
