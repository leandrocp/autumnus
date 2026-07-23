# Benchmarks

Run all benchmarks with `mise run -C benchmarks run`.

## 1 small file for 1 language

Highlight one small Rust file.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 742.151 µs |
| Lumis JS native | 966.167 µs |
| Lumis Elixir | 981.291 µs |
| syntect | 4.713 ms |
| Shiki | 5.722 ms |
| bat | 14.116 ms |
| Lumis JS Wasm | 56.153 ms |
| Lumis CLI | 332.802 ms |

## 1 big file for 1 language

Highlight one generated 5 MiB Rust file.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 2.001 s |
| Lumis JS native | 2.029 s |
| Lumis Elixir | 2.037 s |
| Lumis CLI | 2.639 s |
| syntect | 3.196 s |
| bat | 4.876 s |
| Lumis JS Wasm | 6.316 s |
| Shiki | 8.127 s |

## 10 different files for 1 language

Highlight ten different small Rust files.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 2.563 ms |
| Lumis Elixir | 3.178 ms |
| Lumis JS native | 3.693 ms |
| syntect | 7.057 ms |
| Shiki | 13.695 ms |
| Lumis JS Wasm | 61.424 ms |
| bat | 125.779 ms |
| Lumis CLI | 2.600 s |

## 10 different files for 10 languages

Highlight ten different small files, each in a different language.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 1.696 ms |
| Lumis Elixir | 2.869 ms |
| Lumis JS native | 3.388 ms |
| syntect | 20.870 ms |
| bat | 118.162 ms |
| Shiki | 216.488 ms |
| Lumis JS Wasm | 261.036 ms |
| Lumis CLI | 2.261 s |
