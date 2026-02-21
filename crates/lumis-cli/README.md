# lumis-cli

CLI for [Lumis](https://github.com/leandrocp/lumis). Syntax Highlighter powered by Tree-sitter and Neovim themes.

## Install

```sh
cargo install lumis-cli
```

The binary is called `lumis`.

## Usage

```sh
# Terminal output (default)
lumis highlight main.rs

# Pick a theme
lumis highlight -t dracula main.rs

# HTML with inline styles
lumis highlight -f html-inline -t github_dark main.rs

# HTML with CSS class names (pair with a theme stylesheet)
lumis highlight -f html-linked main.rs

# HTML with multiple themes via CSS custom properties
lumis highlight -f html-multi-themes --themes light:github_light --themes dark:github_dark --default-theme light main.rs

# Highlight specific lines
lumis highlight -h 1,3-5,10 main.rs

# Highlight a string instead of a file
lumis highlight-source -l rust 'fn main() {}'

# Extract a theme from a Neovim colorscheme repo
lumis gen-theme -u https://github.com/catppuccin/nvim -c catppuccin-mocha

# List languages and themes
lumis list-languages
lumis list-themes
```

## Parser management

Parser WASMs are downloaded from CDN on first use and cached locally. You can also manage them explicitly:

```sh
# Pre-download parsers
lumis fetch-parsers rust javascript elixir

# Pre-download all parsers
lumis fetch-parsers --all

# Re-download to get latest versions
lumis update-parsers rust
lumis update-parsers --all

# Verbose output shows cached paths
lumis fetch-parsers -v rust
```

## Data directory

Lumis stores parser WASMs and custom theme files in a local data directory:

| Platform | Default path |
|----------|-------------|
| macOS / Linux | `~/.local/share/lumis/` |
| Windows | `%APPDATA%/lumis/` |

Contents:

- `parsers/` -- cached tree-sitter WASM files
- `themes/` -- custom theme JSON files (visible in `lumis list-themes`)

Override with `--data-dir` or `LUMIS_DATA_DIR`.
