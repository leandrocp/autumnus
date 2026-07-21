# Benchmarks

## 1 small file for 1 language

Highlight one small Rust file.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 739.947 µs |
| Lumis Elixir | 970.167 µs |
| syntect | 4.708 ms |
| Shiki | 5.697 ms |
| bat | 17.773 ms |
| Lumis JS native | 39.814 ms |
| Lumis JS Wasm | 46.497 ms |
| Lumis CLI | 319.759 ms |

## 1 big file for 1 language

Highlight one generated 5 MiB Rust file.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 2.001 s |
| Lumis Elixir | 2.030 s |
| Lumis CLI | 2.642 s |
| Lumis JS native | 2.688 s |
| syntect | 3.183 s |
| bat | 4.888 s |
| Lumis JS Wasm | 6.257 s |
| Shiki | 8.122 s |

## 10 different files for 1 language

Highlight ten different small Rust files.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 2.580 ms |
| Lumis Elixir | 3.024 ms |
| syntect | 7.031 ms |
| Shiki | 13.785 ms |
| Lumis JS native | 42.064 ms |
| Lumis JS Wasm | 51.485 ms |
| bat | 128.889 ms |
| Lumis CLI | 2.595 s |

## 10 different files for 10 languages

Highlight ten different small files: C, CSS, Go, HTML, Java, JavaScript, JSON, Python, Ruby, and Rust.

| Tool | Total |
| --- | ---: |
| Lumis Rust | 1.708 ms |
| Lumis Elixir | 2.741 ms |
| syntect | 20.752 ms |
| bat | 117.933 ms |
| Lumis JS native | 195.430 ms |
| Shiki | 215.330 ms |
| Lumis JS Wasm | 223.193 ms |
| Lumis CLI | 2.262 s |
