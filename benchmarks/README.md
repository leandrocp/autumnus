# Benchmarks

## 1 small file for 1 language

Highlight one small Rust file.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 751.832 µs |
| Lumis Elixir | 3.571 ms |
| syntect | 4.815 ms |
| Shiki | 5.819 ms |
| Lumis JS native | 40.355 ms |
| Lumis JS Wasm | 46.561 ms |
| bat | 192.648 ms |
| Lumis CLI | 485.657 ms |

## 1 big file for 1 language

Highlight one generated 5 MiB Rust file.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 1.992 s |
| Lumis JS native | 2.696 s |
| Lumis CLI | 2.817 s |
| syntect | 3.193 s |
| bat | 5.326 s |
| Lumis JS Wasm | 6.309 s |
| Shiki | 8.152 s |
| Lumis Elixir | 9.223 s |

## 10 different files for 1 language

Highlight ten different small Rust files.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 2.548 ms |
| syntect | 6.994 ms |
| Lumis Elixir | 11.809 ms |
| Shiki | 13.867 ms |
| Lumis JS native | 42.325 ms |
| Lumis JS Wasm | 52.098 ms |
| bat | 405.404 ms |
| Lumis CLI | 2.810 s |

## 10 different files for 10 languages

Highlight ten different small files: C, CSS, Go, HTML, Java, JavaScript, JSON, Python, Ruby, and Rust.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 1.693 ms |
| Lumis Elixir | 8.982 ms |
| syntect | 20.892 ms |
| Shiki | 214.754 ms |
| Lumis JS Wasm | 225.807 ms |
| Lumis JS native | 272.554 ms |
| bat | 392.427 ms |
| Lumis CLI | 2.535 s |
