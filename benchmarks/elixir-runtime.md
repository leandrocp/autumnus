# Elixir runtime: embedded native parsers vs dynamic WASM

Focused comparison run on 2026-07-23 on an Apple M1 Pro (10 cores, 32 GB), using
release builds with LTO, Erlang/OTP 29, Elixir 1.21-dev, and Rust 1.97.
Measurements use identical fixtures and HTML-linked formatting. Timing values
are medians of seven samples unless noted otherwise.

| Metric | Embedded native parsers | Dynamic WASM | Change |
| --- | ---: | ---: | ---: |
| NIF, raw | 149.81 MB | 10.77 MB | -92.8% |
| NIF, gzip -9 | 14.12 MB | 3.82 MB | -73.0% |
| Small Rust file, warm | 724 µs | 938 µs | +29.5% |
| 5 MiB Rust file, warm (5 samples) | 1.853 s | 2.518 s | +35.9% |
| Ten Rust files, warm | 2.476 ms | 3.387 ms | +36.8% |
| Ten files in ten languages, warm | 2.329 ms | 2.305 ms | -1.0% |
| Four concurrent small Rust highlights, per call | 238 µs | 287 µs | +20.7% |
| First highlight per cached language, median | 15 ms | 75 ms | 4.9x |
| Peak RSS after ten languages | 124 MB | 192 MB | +54.5% |
| Peak RSS during the 5 MiB workload | 755 MB | 819 MB | +8.5% |

The first-highlight comparison uses parser files already present on local disk;
it excludes network download time. Dynamic WASM pays compilation once per
language, then reuses the compiled language and a bounded worker pool.

The package-size win is decisive: the compressed precompiled NIF is about one
quarter of the old download. Warm single-language work is 20–37% slower, while
the mixed ten-language workload is effectively equal because the dynamic
runtime caches compiled parser and query state. The tradeoff is higher first-use
latency and memory after many languages are loaded.

For comparison, the published `@lumis-sh/lumis@0.6.1` tarball is 696,523 bytes.
The explicit native Node install adds a 1,751-byte selector and a 14,345,287-byte
macOS ARM64 tarball, for 15,043,561 bytes total. The portable-only package built
from this branch is 712,108 bytes packed (2,991,926 bytes unpacked): 2.2% larger
than the old portable package alone, but 95.3% smaller than the former portable
plus native installation. Removing `@lumis-sh/lumis-native` leaves JavaScript
on the same per-language WASM model as Elixir.
