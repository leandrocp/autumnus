# Benchmarks

Run all benchmarks and regenerate this file with `mise run -C benchmarks run`.

The timing rows use local workspace source for every Lumis runtime.

**Highlight** is the per-call cost with a prepared highlighter. **Setup** is
what building that highlighter costs once the process is warm. They are
separated because the runtimes cache very differently, and timing them
together compares caching rather than highlighting.

Every Lumis row except Rust loads the same WebAssembly parsers; Rust compiles
its own in and is the floor rather than something anyone installs. What differs
between the two JavaScript rows is which engine runs those parsers and where
the highlight pass happens: **(Node, Wasmtime)** runs them under Wasmtime in a
native addon and walks and formats in Rust, the same code the CLI and Elixir
run; **(web-tree-sitter)** runs them under V8 and walks and formats in
JavaScript. That second one is what browsers use, and what Node falls back to
where no addon is built.

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
| Lumis JavaScript (Node, Wasmtime) (runtime) | npm production closure including the platform addon; parsers load on demand | 16.07 MiB | 6.19 MiB |
| Lumis JavaScript (Node, Wasmtime) (10 languages) | npm production closure including the platform addon, plus benchmark parsers | 28.50 MiB | 7.60 MiB |
| Lumis JavaScript (web-tree-sitter) (runtime) | npm production closure without the platform addon; parsers load on demand | 5.82 MiB | 1.48 MiB |
| Lumis JavaScript (web-tree-sitter) (1 language) | npm production closure plus Rust parser | 8.32 MiB | 1.74 MiB |
| Lumis JavaScript (web-tree-sitter) (10 languages) | npm production closure plus benchmark parsers | 18.26 MiB | 2.89 MiB |
| Shiki | npm production closure | 13.65 MiB | 2.66 MiB |
| highlight.js | npm production closure | 5.18 MiB | 818.43 KiB |
| Lumis Rust | stripped 10-language benchmark executable | 7.13 MiB | 1.43 MiB |
| syntect | stripped default-syntax benchmark executable | 1.28 MiB | 756.50 KiB |
| Lumis CLI | stripped release executable | 12.17 MiB | 5.03 MiB |
| bat | release executable | 5.54 MiB | 3.10 MiB |
| Lumis Elixir | stripped release NIF shared library | 12.08 MiB | 4.95 MiB |

## 1 small file for 1 language

Highlight one small Rust file.

| Tool | Highlight | Setup |
| --- | ---: | ---: |
| highlight.js | 458.208 µs | 66.875 µs |
| Lumis Rust | 762.453 µs | — |
| Lumis JavaScript (Node, Wasmtime) | 1.170 ms | 594.250 µs |
| Lumis Elixir | 1.179 ms | — |
| Shiki | 3.301 ms | 358.916 µs |
| Lumis JavaScript (web-tree-sitter) | 4.425 ms | 55.041 ms |
| syntect | 5.081 ms | — |
| bat | 12.955 ms | — |
| Lumis CLI | 53.338 ms | — |

## 1 big file for 1 language

Highlight one generated 5 MiB Rust file.

| Tool | Highlight | Setup |
| --- | ---: | ---: |
| highlight.js | 689.556 ms | 186.292 µs |
| Lumis Rust | 2.126 s | — |
| Lumis CLI | 2.413 s | — |
| Lumis Elixir | 2.688 s | — |
| Lumis JavaScript (Node, Wasmtime) | 2.732 s | 747.375 µs |
| syntect | 3.292 s | — |
| bat | 4.929 s | — |
| Lumis JavaScript (web-tree-sitter) | 7.446 s | 129.877 ms |
| Shiki | 8.143 s | 418.042 µs |

## 10 different files for 1 language

Highlight ten different small Rust files.

| Tool | Highlight | Setup |
| --- | ---: | ---: |
| highlight.js | 1.260 ms | 81.667 µs |
| Lumis Rust | 2.643 ms | — |
| Lumis Elixir | 3.759 ms | — |
| Lumis JavaScript (Node, Wasmtime) | 4.513 ms | 534.333 µs |
| syntect | 7.172 ms | — |
| Lumis JavaScript (web-tree-sitter) | 11.159 ms | 53.352 ms |
| Shiki | 11.553 ms | 368.125 µs |
| bat | 133.097 ms | — |
| Lumis CLI | 567.182 ms | — |

## 10 different files for 10 languages

Highlight ten different small files, each in a different language.

| Tool | Highlight | Setup |
| --- | ---: | ---: |
| highlight.js | 1.392 ms | 356.000 µs |
| Lumis Rust | 1.732 ms | — |
| Lumis Elixir | 2.686 ms | — |
| Lumis JavaScript (Node, Wasmtime) | 3.240 ms | 1.582 ms |
| Lumis JavaScript (web-tree-sitter) | 6.700 ms | 263.829 ms |
| Shiki | 6.994 ms | 8.985 ms |
| syntect | 21.226 ms | — |
| bat | 123.135 ms | — |
| Lumis CLI | 307.943 ms | — |
