---
sidebar_position: 1
slug: /reference/runtimes
title: Runtimes
description: Package and API references for Lumis across Rust, Elixir, JavaScript, Java, and CLI.
keywords:
  - lumis
  - docs.rs
  - hexdocs
  - npm
  - java
---

# Runtimes

## Main packages

| Runtime | Package | Reference |
| --- | --- | --- |
| JavaScript | `@lumis-sh/lumis` | [npm](https://www.npmjs.com/package/@lumis-sh/lumis) |
| Rust | `lumis` | [docs.rs](https://docs.rs/lumis) |
| Elixir | `lumis` | [HexDocs](https://hexdocs.pm/lumis) |
| Java | `lumis4j` | [GitHub](https://github.com/roastedroot/lumis4j) |

`@lumis-sh/lumis` covers Node.js, Bun, Deno, browser apps, and Edge runtimes through the same JavaScript package.

## CLI

| Package | Reference |
| --- | --- |
| `lumis-cli` (`lumis` binary) | [README](https://github.com/leandrocp/lumis/tree/main/crates/lumis-cli) |

## Themes

| Runtime | Package | Reference |
| --- | --- | --- |
| JavaScript | `@lumis-sh/themes` | [npm](https://www.npmjs.com/package/@lumis-sh/themes) |

## Integrations

| Runtime | Integration | Package | Reference |
| --- | --- | --- | --- |
| JavaScript | React | `@lumis-sh/react` | [npm](https://www.npmjs.com/package/@lumis-sh/react) |
| JavaScript | `markdown-it` | `@lumis-sh/markdown-it-lumis` | [npm](https://www.npmjs.com/package/@lumis-sh/markdown-it-lumis) |
| JavaScript | `rehype` | `@lumis-sh/rehype-lumis` | [npm](https://www.npmjs.com/package/@lumis-sh/rehype-lumis) |

## WASM language packages

JavaScript parser grammars are also published as per-language WASM packages such as `@lumis-sh/wasm-rust`, `@lumis-sh/wasm-javascript`, and `@lumis-sh/wasm-elixir`.

Preset bundle packages are also available, such as `@lumis-sh/wasm-bundle-web`, `@lumis-sh/wasm-bundle-web-extra`, `@lumis-sh/wasm-bundle-system`, and `@lumis-sh/wasm-bundle-backend`.

- package list: [Languages](/reference/languages)
- browser helper for npm parser packages: `withWasm()` from `@lumis-sh/lumis`
- browser helper for npm preset bundles: `withWasmBundle()` from `@lumis-sh/lumis`
- loading and resolver behavior: [WASM and CDN](/advanced/wasm-and-cdn)
- edge-runtime API notes: [JavaScript Runtime](/usage/javascript)
