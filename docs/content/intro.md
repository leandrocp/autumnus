---
sidebar_position: 1
slug: /
title: Intro
description: Lumis is a Tree-sitter syntax highlighter with Neovim themes and one first-party API across CLI, Rust, Elixir, and JavaScript.
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
- 110+ languages with nested language support
- 250+ themes sourced from Neovim colorschemes
- 5 formatters: HTML Inline, HTML Linked, HTML Multi-Themes, Terminal, and BBCode Scoped
- handles incomplete code (useful for streaming)
- one API across first-party runtimes: CLI, Rust, Elixir, and JavaScript in Node and browsers

The community-maintained [Java integration](https://github.com/roastedroot/lumis4j)
has its own API and release cadence.

## How it works

- [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) parses code into syntax trees
- [Neovim colorschemes](https://github.com/topics/neovim-colorscheme) supply the color data
- highlight queries come from [`nvim-treesitter`](https://github.com/nvim-treesitter/nvim-treesitter)

---

Every code block on this site is highlighted by Lumis itself, using the [multi-themes formatter](/formatters/html-multi-themes) with `github_light` and `github_dark` themes for automatic light/dark mode switching.
