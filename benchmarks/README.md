# Benchmarks

Run all benchmarks and regenerate this file with `mise run -C benchmarks run`.

The timing rows use local workspace source for every Lumis runtime.

Four of the five run the same Wasmtime engine and load parsers as WebAssembly
at runtime: **Lumis JavaScript Node** through a native addon, plus the CLI and
Elixir. **Lumis JavaScript Wasm** is the `web-tree-sitter` runtime that browsers
use, and that Node falls back to where no addon is built; it assembles events
and formats them in JavaScript, which is most of the gap between the two rows.
**Lumis Rust** compiles its parsers in, so it is the floor rather than a
distribution anyone installs.

See the [focused before/after report](elixir-runtime.md) for Elixir cold
loading, concurrency, and memory.

## Visual output comparison

Generate the gallery with `mise run -C benchmarks showcase`, then open
[`index.html`](index.html) directly in a browser.

This comparison is separate from timing. Every implementation highlights the
same pinned 1,397-line Three.js HTML file, including injected CSS, JSON, and
JavaScript, with the Dracula theme. The gallery covers Lumis Rust, JavaScript
Wasm, Elixir, and CLI alongside Shiki, highlight.js, syntect, and bat. Its
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
| Lumis JavaScript Node (runtime) | npm production closure including the platform addon; parsers load on demand | 16.07 MiB | 6.19 MiB |
| Lumis JavaScript Node (10 languages) | npm production closure including the platform addon, plus benchmark parsers | 28.50 MiB | 7.60 MiB |
| Lumis JavaScript Wasm (runtime) | npm production closure without the platform addon; parsers load on demand | 5.82 MiB | 1.48 MiB |
| Lumis JavaScript Wasm (1 language) | npm production closure plus Rust parser | 8.32 MiB | 1.74 MiB |
| Lumis JavaScript Wasm (10 languages) | npm production closure plus benchmark parsers | 18.26 MiB | 2.89 MiB |
| Shiki | npm production closure | 13.65 MiB | 2.66 MiB |
| highlight.js | npm production closure | 5.18 MiB | 818.43 KiB |
| Lumis Rust | stripped 10-language benchmark executable | 7.13 MiB | 1.43 MiB |
| syntect | stripped default-syntax benchmark executable | 1.28 MiB | 756.50 KiB |
| Lumis CLI | stripped release executable | 12.17 MiB | 5.03 MiB |
| bat | release executable | 5.54 MiB | 3.10 MiB |
| Lumis Elixir | stripped release NIF shared library | 12.08 MiB | 4.95 MiB |

## 1 small file for 1 language

Highlight one small Rust file.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 759.461 µs |
| Lumis Elixir | 1.172 ms |
| Lumis JavaScript Node | 1.553 ms |
| highlight.js | 2.038 ms |
| syntect | 4.774 ms |
| Shiki | 5.822 ms |
| bat | 12.934 ms |
| Lumis CLI | 55.911 ms |
| Lumis JavaScript Wasm | 57.397 ms |

## 1 big file for 1 language

Highlight one generated 5 MiB Rust file.

| Tool | Total |
| --- | ---: |
| highlight.js | 683.769 ms |
| Lumis Rust | 2.061 s |
| Lumis CLI | 2.483 s |
| Lumis JavaScript Node | 2.707 s |
| Lumis Elixir | 2.743 s |
| syntect | 3.241 s |
| bat | 5.011 s |
| Lumis JavaScript Wasm | 7.528 s |
| Shiki | 8.274 s |

## 10 different files for 1 language

Highlight ten different small Rust files.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 2.615 ms |
| highlight.js | 3.349 ms |
| Lumis Elixir | 3.863 ms |
| Lumis JavaScript Node | 4.831 ms |
| syntect | 7.168 ms |
| Shiki | 14.134 ms |
| Lumis JavaScript Wasm | 64.457 ms |
| bat | 140.923 ms |
| Lumis CLI | 579.022 ms |

## 10 different files for 10 languages

Highlight ten different small files, each in a different language.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 1.735 ms |
| Lumis Elixir | 2.867 ms |
| Lumis JavaScript Node | 4.488 ms |
| syntect | 21.432 ms |
| highlight.js | 40.767 ms |
| bat | 125.413 ms |
| Shiki | 219.910 ms |
| Lumis JavaScript Wasm | 271.463 ms |
| Lumis CLI | 312.777 ms |
