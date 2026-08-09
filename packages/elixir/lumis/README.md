# Lumis

<!-- MDOC -->

<p align="center">
  Syntax highlighter powered by Tree-sitter and Neovim themes.
</p>

<p align="center">
  <a href="https://lumis.sh">https://lumis.sh</a>
</p>

<div align="center">
  <a href="https://hex.pm/packages/lumis">
    <img alt="Hex Version" src="https://img.shields.io/hexpm/v/lumis">
  </a>

  <a href="https://hexdocs.pm/lumis">
    <img alt="Hex Docs" src="http://img.shields.io/badge/hex.pm-docs-green.svg?style=flat">
  </a>

  <a href="https://opensource.org/licenses/MIT">
    <img alt="MIT" src="https://img.shields.io/hexpm/l/lumis">
  </a>
</div>

## Features

- **110+ Tree-sitter languages** - Fast, accurate, and updated syntax parsing
- **250+ built-in Neovim themes** - Updated and curated themes from the Neovim community
- **Built-in formatters** - HTML (inline/linked), Terminal (ANSI), Multi-theme (light/dark), BBCode
- **Custom formatters** - Build your own output
- **Language auto-detection** - File extension, shebang, and emacs-mode support
- **Line highlighting** - Mark and style individual lines, with custom HTML wrappers
- **Streaming-friendly** - Handles incomplete code
- **Load parsers on demand** - Verified and cached, including injected languages

## Installation

```elixir
def deps do
  [
    {:lumis, "~> 0.3"}
  ]
end
```

## Usage

```elixir
iex> Lumis.highlight!("Atom.to_string(:elixir)", formatter: {:html_inline, language: "elixir"})
```

The language is optional — Lumis detects it from the source, a filename, or a
shebang. Themes are named: `theme: "github_light"`, or a `Lumis.Theme` struct
built from your own JSON.

Formatters decide the output: `:html_inline`, `:html_linked`,
`:html_multi_themes`, `:terminal`, `:bbcode_scoped`, or your own.

## Parsers

Highlighting downloads, verifies and loads whatever a document needs, including
languages injected inside it, and caches them for every later request. Loading is
global to the VM, so only the first process pays.

```elixir
# move the download off the first request
Lumis.Languages.load(["elixir", "html", "javascript", "css"])
```

```sh
# better: bake parsers into the image, so no request ever pays
mix lumis.languages.cache elixir html javascript css
```

Parsers live under `LUMIS_DATA_DIR`, or `config :lumis, data_dir:`.

## Documentation

- [Elixir integration](https://lumis.sh/docs/usage/elixir-integration) — configuration, releases, Phoenix
- [Formatters](https://lumis.sh/docs/usage/formatters) — every formatter and its options
- [Themes](https://lumis.sh/docs/usage/themes) — the theme list, custom themes, CSS files
- [Languages](https://lumis.sh/docs/reference/languages) — what is supported and how detection works
- [Line highlighting](https://lumis.sh/docs/usage/line-highlighting)
- [Recipes](https://lumis.sh/docs/recipes) — LiveView rendering, light/dark, injected languages

API reference: [hexdocs.pm/lumis](https://hexdocs.pm/lumis).

## Acknowledgements

* [Makeup](https://hex.pm/packages/makeup) for setting up the baseline and for the inspiration
* [Inkjet](https://crates.io/crates/inkjet) for the Rust implementation up to v0.2 and for the inspiration
