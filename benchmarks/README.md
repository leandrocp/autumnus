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

It also counts the tokens each implementation coloured in each document, so
the gallery can say how finely a file was resolved next to the output itself.

## Publishing to the website

The deploy workflow builds only `website/` and `docs/`, so it cannot run any
of this. Both sets of numbers are committed, and these refresh them:

```sh
mise run -C benchmarks showcase-publish
mise run -C benchmarks results-publish
```

`showcase-publish` writes the gallery and its token counts, and CI fails when
the committed bytes stop matching. `results-publish` writes the timings below,
which no check can verify because they are measurements; run it from a quiet
machine or the site will quote whatever that machine was also doing.

## Package size

Measured on Apple M1 Pro (arm64, darwin).
npm rows sum the packed and unpacked sizes of each unique production package.
Native rows compare the raw release artifact with deterministic gzip level 9.
Compare rows within the same artifact class; npm packages, executables, and a NIF
are not interchangeable distribution formats.

| Tool | Measured artifact | Raw / unpacked | Download / gzip -9 |
| --- | --- | ---: | ---: |
| Lumis JavaScript (Node, Wasmtime) (runtime) | npm production closure including the platform addon; parsers load on demand | 16.95 MiB | 6.43 MiB |
| Lumis JavaScript (Node, Wasmtime) (10 languages) | npm production closure including the platform addon, plus benchmark parsers | 29.43 MiB | 7.85 MiB |
| Lumis JavaScript (web-tree-sitter) (runtime) | npm production closure without the platform addon; parsers load on demand | 6.54 MiB | 1.65 MiB |
| Lumis JavaScript (web-tree-sitter) (1 language) | npm production closure plus Rust parser | 9.03 MiB | 1.91 MiB |
| Lumis JavaScript (web-tree-sitter) (10 languages) | npm production closure plus benchmark parsers | 19.03 MiB | 3.06 MiB |
| Shiki | npm production closure | 14.09 MiB | 2.71 MiB |
| highlight.js | npm production closure | 5.18 MiB | 818.43 KiB |
| Lumis Rust | stripped 10-language benchmark executable | 12.03 MiB | 2.09 MiB |
| syntect | stripped default-syntax benchmark executable | 1.28 MiB | 756.85 KiB |
| Lumis CLI | stripped release executable | 12.23 MiB | 5.06 MiB |
| bat | release executable | 5.54 MiB | 3.10 MiB |
| Lumis Elixir | stripped release NIF shared library | 12.16 MiB | 4.98 MiB |

## 1 small file for 1 language

Highlight one small Rust file.

| Tool | Highlight | Setup |
| --- | ---: | ---: |
| highlight.js | 520.916 µs | 100.250 µs |
| Lumis Rust | 933.329 µs | — |
| Lumis Elixir | 1.426 ms | — |
| Lumis JavaScript (Node, Wasmtime) | 1.481 ms | 50.101 ms |
| Shiki | 3.524 ms | 538.291 µs |
| Lumis JavaScript (web-tree-sitter) | 4.857 ms | 55.963 ms |
| syntect | 5.191 ms | — |
| bat | 13.031 ms | — |
| Lumis CLI | 54.277 ms | — |

## 1 big file for 1 language

Highlight one generated 5 MiB Rust file.

| Tool | Highlight | Setup |
| --- | ---: | ---: |
| highlight.js | 750.527 ms | 204.125 µs |
| Lumis Rust | 2.159 s | — |
| Lumis CLI | 2.518 s | — |
| Lumis Elixir | 2.832 s | — |
| Lumis JavaScript (Node, Wasmtime) | 2.845 s | 50.397 ms |
| syntect | 3.635 s | — |
| bat | 5.166 s | — |
| Shiki | 8.836 s | 426.166 µs |
| Lumis JavaScript (web-tree-sitter) | 9.062 s | 56.409 ms |

## 10 different files for 1 language

Highlight ten different small Rust files.

| Tool | Highlight | Setup |
| --- | ---: | ---: |
| highlight.js | 1.428 ms | 81.416 µs |
| Lumis Rust | 2.582 ms | — |
| Lumis Elixir | 4.171 ms | — |
| Lumis JavaScript (Node, Wasmtime) | 4.937 ms | 49.873 ms |
| syntect | 7.639 ms | — |
| Shiki | 12.430 ms | 432.792 µs |
| Lumis JavaScript (web-tree-sitter) | 12.788 ms | 55.723 ms |
| bat | 149.420 ms | — |
| Lumis CLI | 599.630 ms | — |

## 10 different files for 10 languages

Highlight ten different small files, each in a different language.

| Tool | Highlight | Setup |
| --- | ---: | ---: |
| highlight.js | 1.552 ms | 416.166 µs |
| Lumis Rust | 2.119 ms | — |
| Lumis Elixir | 3.108 ms | — |
| Lumis JavaScript (Node, Wasmtime) | 3.733 ms | 245.742 ms |
| Shiki | 7.394 ms | 10.311 ms |
| Lumis JavaScript (web-tree-sitter) | 7.629 ms | 287.011 ms |
| syntect | 22.727 ms | — |
| bat | 132.850 ms | — |
| Lumis CLI | 335.525 ms | — |
