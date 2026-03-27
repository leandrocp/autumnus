---
sidebar_position: 1
slug: /
title: Intro
description: Lumis is a Tree-sitter syntax highlighter with Neovim themes and one workflow across CLI, Rust, Elixir, JavaScript, and Java.
keywords:
  - lumis
  - syntax highlighting
  - tree-sitter
  - neovim themes
  - rust
  - elixir
  - javascript
  - java
---

# Intro

Lumis is a syntax highlighter built on [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) and [Neovim themes](https://github.com/topics/neovim-colorscheme).

It keeps the same core workflow across runtimes:

1. pick a language
2. pick a theme
3. pick a formatter
4. render HTML or terminal output

## Why Lumis

- Tree-sitter parsing instead of regex-based tokenization
- 70+ languages with nested language support
- 100+ themes sourced from Neovim colorschemes
- HTML inline, HTML linked, multi-theme HTML, terminal, and BBCode output
- handles incomplete code (useful for streaming)
- one API across CLI, Rust, Elixir, JavaScript, browser, and Java

## How it works

- [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) parses code into syntax trees
- [Neovim colorschemes](https://github.com/topics/neovim-colorscheme) supply the color data
- highlight queries come from [`nvim-treesitter`](https://github.com/nvim-treesitter/nvim-treesitter)

## What you can do

- render one-off snippets with `highlight`
- preload languages for repeated usage
- switch between inline styles, CSS classes, CSS variables, and ANSI output
- highlight individual lines
- load or generate custom themes
- build your own formatter on top of highlighted tokens

## Runtimes

| Runtime | Good fit | Main package |
| --- | --- | --- |
| CLI | scripts, local workflows, parser/theme management | `lumis-cli` (`lumis` binary) |
| Rust | backends, static sites, editors | `lumis` |
| Elixir | Phoenix, LiveView, BEAM apps | `lumis` |
| JavaScript | Node.js, browser apps, build tools | `@lumis-sh/lumis` |
| JS integrations | markdown-it and rehype content pipelines | `@lumis-sh/markdown-it-lumis`, `@lumis-sh/rehype-lumis` |
| Themes | CSS themes and JSON theme modules | `@lumis-sh/themes` |
| Java | JVM apps | `lumis4j` |

## Recommended path

1. [Installation](./installation)
2. [Highlight](./highlight) — the core workflow
3. [Formatters](./formatters) — choose an output style
4. [Themes](./themes) — customize colors
5. [Architecture](./architecture) — how the pipeline works
6. [Examples](./examples) — copy-paste recipes
7. [Languages reference](./reference/languages) — full list

---

Every code block on this site is highlighted by Lumis itself, using the [multi-themes formatter](/formatters/html-multi-themes) with `github_light` and `github_dark` themes for automatic light/dark mode switching.
