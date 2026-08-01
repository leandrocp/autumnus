# Benchmarks

Run all benchmarks and regenerate this file with `mise run -C benchmarks run`.

The timing rows use local workspace source for every Lumis runtime. The Elixir
rows use dynamic WASM; see the [focused before/after report](elixir-runtime.md)
for cold loading, concurrency, and memory measurements.

## Visual output comparison

Generate the gallery with `mise run -C benchmarks showcase`, then open
[`index.html`](index.html) directly in a browser.

This comparison is separate from timing. Every implementation highlights the
same pinned 1,397-line Three.js HTML file, including injected CSS, JSON, and
JavaScript, with the Dracula theme. The gallery covers Lumis Rust, JavaScript
WASM, Elixir, and CLI alongside Shiki, highlight.js, syntect, and bat. Its
preparation step verifies SHA-256 hashes for both the fixture and syntect's
official Dracula theme before rendering.

## Package size

Measured on Apple M1 Pro (arm64, darwin).
npm rows sum the packed and unpacked sizes of each unique production package.
Native rows compare the raw release artifact with deterministic gzip level 9.
Compare rows within the same artifact class; npm packages, executables, and a NIF
are not interchangeable distribution formats.

| Tool | Measured artifact | Raw / unpacked | Download / gzip -9 |
| --- | --- | ---: | ---: |
| Lumis JavaScript WASM (runtime) | npm production closure; parsers ship separately | 7.19 MiB | 1.75 MiB |
| Lumis JavaScript WASM (1 language) | npm production closure plus Rust parser | 9.68 MiB | 2.02 MiB |
| Lumis JavaScript WASM (10 languages) | npm production closure plus benchmark parsers | 19.63 MiB | 3.17 MiB |
| Shiki | npm production closure | 13.65 MiB | 2.66 MiB |
| highlight.js | npm production closure | 5.18 MiB | 818.43 KiB |
| Lumis Rust | stripped 10-language benchmark executable | 7.11 MiB | 1.43 MiB |
| syntect | stripped default-syntax benchmark executable | 1.28 MiB | 756.63 KiB |
| Lumis CLI | stripped release executable | 12.88 MiB | 5.15 MiB |
| bat | release executable | 5.54 MiB | 3.10 MiB |
| Lumis Elixir | stripped release NIF shared library | 11.43 MiB | 4.29 MiB |

## 1 small file for 1 language

Highlight one small Rust file.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 740.745 µs |
| Lumis Elixir | 1.148 ms |
| highlight.js | 2.034 ms |
| syntect | 4.738 ms |
| Shiki | 5.825 ms |
| bat | 14.543 ms |
| Lumis JavaScript WASM | 57.771 ms |
| Lumis CLI | 105.400 ms |

## 1 big file for 1 language

Highlight one generated 5 MiB Rust file.

| Tool | Total |
| --- | ---: |
| highlight.js | 681.660 ms |
| Lumis Rust | 2.010 s |
| Lumis CLI | 2.372 s |
| Lumis Elixir | 2.686 s |
| syntect | 3.219 s |
| bat | 4.890 s |
| Lumis JavaScript WASM | 6.870 s |
| Shiki | 8.138 s |

## 10 different files for 1 language

Highlight ten different small Rust files.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 2.572 ms |
| highlight.js | 3.313 ms |
| Lumis Elixir | 3.748 ms |
| syntect | 7.103 ms |
| Shiki | 13.954 ms |
| Lumis JavaScript WASM | 62.229 ms |
| bat | 126.869 ms |
| Lumis CLI | 583.361 ms |

## 10 different files for 10 languages

Highlight ten different small files, each in a different language.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 1.831 ms |
| Lumis Elixir | 2.584 ms |
| syntect | 20.899 ms |
| highlight.js | 38.151 ms |
| bat | 120.270 ms |
| Shiki | 217.777 ms |
| Lumis JavaScript WASM | 268.124 ms |
| Lumis CLI | 316.780 ms |
