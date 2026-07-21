# Benchmark operating rules

- Benchmark only the four scenarios in `fixtures/manifest.json`.
- Generate and verify fixtures before timing.
- Every implementation must consume the exact same fixture bytes and highlight count.
- Track only Total: runtime setup/load plus every highlight in the scenario. Harness fixture reads are excluded; real CLI file I/O remains inside each command.
- Use Criterion for Rust, Mitata for JavaScript, Benchee for Elixir, and Hyperfine for CLI tools.
- Hyperfine must receive generated command chains containing only public CLI calls; JavaScript preparation and Mise coordination stay outside timing.
- Run benchmark families serially through Mise.
- Consume and validate every output.
- Reject native-tool reports with fewer than three timing samples.
- Validate highlighted output from every implementation; formatter-specific output size is metadata, not a benchmark result.
- Keep benchmark dependencies outside published packages.
- Only remove benchmark-owned files under `target/benchmarks/`.
