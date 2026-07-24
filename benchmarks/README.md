# Benchmarks

Run all benchmarks and regenerate this file with `mise run -C benchmarks run`.

The timing rows use local workspace source for every Lumis runtime. The Elixir
rows use dynamic WASM; see the [focused before/after report](elixir-runtime.md)
for cold loading, concurrency, and memory measurements.

## Package size

Measured on Apple M1 Pro (arm64, darwin).
npm rows sum the packed and unpacked sizes of each unique production package.
Native rows compare the raw release artifact with deterministic gzip level 9.
Compare rows within the same artifact class; npm packages, executables, and a NIF
are not interchangeable distribution formats.

| Tool | Measured artifact | Raw / unpacked | Download / gzip -9 |
| --- | --- | ---: | ---: |
| Lumis JS WASM (runtime) | npm production closure; parsers load on demand | 7.19 MiB | 1.75 MiB |
| Lumis JS WASM (1 language) | npm production closure plus Rust parser | 9.68 MiB | 2.02 MiB |
| Lumis JS WASM (10 languages) | npm production closure plus benchmark parsers | 19.63 MiB | 3.17 MiB |
| Shiki 4.3.1 | npm production closure | 13.65 MiB | 2.66 MiB |
| Lumis Rust | stripped 10-language benchmark executable | 7.11 MiB | 1.43 MiB |
| syntect 5.3 | stripped default-syntax benchmark executable | 1.28 MiB | 756.70 KiB |
| Lumis CLI | stripped release executable | 12.88 MiB | 5.15 MiB |
| bat 0.26.1 | release executable | 5.54 MiB | 3.10 MiB |
| Lumis Elixir | stripped release NIF shared library | 11.38 MiB | 4.28 MiB |

## 1 small file for 1 language

Highlight one small Rust file.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 751.666 µs |
| Lumis Elixir | 1.175 ms |
| syntect | 4.731 ms |
| Shiki | 5.819 ms |
| bat | 13.793 ms |
| Lumis JS Wasm | 55.879 ms |
| Lumis CLI | 107.601 ms |

## 1 big file for 1 language

Highlight one generated 5 MiB Rust file.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 2.017 s |
| Lumis CLI | 2.376 s |
| Lumis Elixir | 2.683 s |
| syntect | 3.205 s |
| bat | 4.911 s |
| Lumis JS Wasm | 6.822 s |
| Shiki | 8.214 s |

## 10 different files for 1 language

Highlight ten different small Rust files.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 2.583 ms |
| Lumis Elixir | 3.805 ms |
| syntect | 7.078 ms |
| Shiki | 13.997 ms |
| Lumis JS Wasm | 62.042 ms |
| bat | 131.711 ms |
| Lumis CLI | 571.353 ms |

## 10 different files for 10 languages

Highlight ten different small files, each in a different language.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 1.846 ms |
| Lumis Elixir | 2.658 ms |
| syntect | 20.909 ms |
| bat | 120.963 ms |
| Shiki | 215.709 ms |
| Lumis JS Wasm | 263.346 ms |
| Lumis CLI | 323.160 ms |
