# lumis-cli

CLI for [Lumis](https://github.com/leandrocp/lumis), a syntax highlighter powered by Tree-sitter and Neovim themes.

The installed binary is `lumis`.

## Features

- **110+ Tree-sitter languages** - Fast, accurate, and updated syntax parsing
- **250+ built-in Neovim themes** - Updated and curated themes from the Neovim community
- **Multiple outputs** - HTML (inline/linked), Terminal (ANSI), Multi-theme (light/dark), BBCode, and custom formatters
- **Language auto-detection** - File extension, shebang, and emacs-mode support
- **Line highlighting** - Mark and style individual lines, with custom HTML wrappers
- **Streaming-friendly** - Handles incomplete code
- **Parsers on demand** - Downloaded, verified by SHA-256, and cached, including languages injected inside a document

## Install

```sh
npx @lumis-sh/cli --help
npm install -g @lumis-sh/cli
```

From crates.io:

```sh
cargo install lumis-cli
```

## Commands

```text
lumis highlight          Highlight a file or stdin
lumis dump tree          Print configurable Tree-sitter syntax trees
lumis dump events        Print raw highlight events as JSON
lumis languages list     List supported language ids and file patterns
lumis themes list        List built-in themes and custom themes in the data dir
lumis themes generate    Extract a theme JSON file from a Neovim colorscheme repo
lumis parsers cache      Cache parser WASMs so later runs skip the download
```

## Usage

```sh
lumis highlight src/main.rs
lumis highlight -t dracula -f html-inline src/main.rs -o out.html
lumis highlight -l python <<< 'x = 1'
```

Terminal output is the default. The language comes from the filename; `-l` is
only needed when reading stdin.

Parsers download on demand into the data directory (`LUMIS_DATA_DIR`, otherwise
the platform default) and are verified before use. `lumis parsers cache` fetches
and compiles them ahead of time, and every Lumis runtime reads that same
directory, so a cache prepared here also starts Elixir and Node warm.

## Documentation

- [CLI commands](https://lumis.sh/docs/cli/commands) — every command, flag and default
- [CLI highlighting](https://lumis.sh/docs/usage/cli-highlight) and [behavior](https://lumis.sh/docs/usage/cli-behavior)
- [Themes](https://lumis.sh/docs/usage/themes) — the theme list and custom themes
- [Caching parsers](https://lumis.sh/docs/recipes/cache-parsers-cli)
