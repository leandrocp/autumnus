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
| Lumis JS WASM (runtime) | npm production closure; parsers load on demand | 7.17 MiB | 1.75 MiB |
| Lumis JS WASM (1 language) | npm production closure plus Rust parser | 9.66 MiB | 2.01 MiB |
| Lumis JS WASM (10 languages) | npm production closure plus benchmark parsers | 19.55 MiB | 3.16 MiB |
| Shiki 4.3.1 | npm production closure | 13.65 MiB | 2.66 MiB |
| Lumis Rust | stripped 10-language benchmark executable | 7.11 MiB | 1.43 MiB |
| syntect 5.3 | stripped default-syntax benchmark executable | 1.28 MiB | 756.70 KiB |
| Lumis CLI | stripped release executable | 12.85 MiB | 5.14 MiB |
| bat 0.26.1 | release executable | 5.54 MiB | 3.10 MiB |
| Lumis Elixir | stripped release NIF shared library | 10.58 MiB | 3.91 MiB |

## 1 small file for 1 language

Highlight one small Rust file.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 795.125 µs |
| Lumis Elixir | 1.257 ms |
| syntect | 5.071 ms |
| Shiki | 5.927 ms |
| bat | 13.879 ms |
| Lumis JS Wasm | 58.245 ms |
| Lumis CLI | 103.718 ms |

## 1 big file for 1 language

Highlight one generated 5 MiB Rust file.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 2.096 s |
| Lumis CLI | 2.426 s |
| Lumis Elixir | 2.770 s |
| syntect | 3.292 s |
| bat | 5.053 s |
| Lumis JS Wasm | 7.206 s |
| Shiki | 8.484 s |

## 10 different files for 1 language

Highlight ten different small Rust files.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 2.710 ms |
| Lumis Elixir | 4.159 ms |
| syntect | 7.473 ms |
| Shiki | 14.558 ms |
| Lumis JS Wasm | 64.230 ms |
| bat | 148.974 ms |
| Lumis CLI | 565.881 ms |

## 10 different files for 10 languages

Highlight ten different small files, each in a different language.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 1.871 ms |
| Lumis Elixir | 2.898 ms |
| syntect | 22.333 ms |
| bat | 136.079 ms |
| Shiki | 225.740 ms |
| Lumis JS Wasm | 274.580 ms |
| Lumis CLI | 321.827 ms |
