---
sidebar_position: 1
slug: /reference/platforms
title: Platforms
description: Package and API references for Lumis across Rust, Elixir, JavaScript, Java, and CLI.
keywords:
  - lumis
  - docs.rs
  - hexdocs
  - npm
  - java
---

# Platforms

## Main packages

| Platform | Package | Reference |
| --- | --- | --- |
| JavaScript | `@lumis-sh/lumis` | [npm](https://www.npmjs.com/package/@lumis-sh/lumis) |
| Rust | `lumis` | [docs.rs](https://docs.rs/lumis) |
| Elixir | `lumis` | [HexDocs](https://hexdocs.pm/lumis) |
| Java | `lumis4j` | [GitHub](https://github.com/roastedroot/lumis4j) |

## CLI

| Package | Reference |
| --- | --- |
| `lumis-cli` (`lumis` binary) | [README](https://github.com/leandrocp/lumis/tree/main/crates/lumis-cli) |

## Themes

| Platform | Package | Reference |
| --- | --- | --- |
| JavaScript | `@lumis-sh/themes` | [npm](https://www.npmjs.com/package/@lumis-sh/themes) |

## Integrations

| Platform | Integration | Package | Reference |
| --- | --- | --- | --- |
| JavaScript | `markdown-it` | `@lumis-sh/markdown-it-lumis` | [npm](https://www.npmjs.com/package/@lumis-sh/markdown-it-lumis) |
| JavaScript | `rehype` | `@lumis-sh/rehype-lumis` | [npm](https://www.npmjs.com/package/@lumis-sh/rehype-lumis) |

## WASM language packages

JavaScript parser grammars are also published as per-language WASM packages such as `@lumis-sh/wasm-rust`, `@lumis-sh/wasm-javascript`, and `@lumis-sh/wasm-elixir`.

- package list: [Languages](/reference/languages)
- browser helper for npm parser packages: `withWasm()` from `@lumis-sh/lumis`
- loading and resolver behavior: [WASM and CDN](/advanced/wasm-and-cdn)
