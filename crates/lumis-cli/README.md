# lumis-cli

CLI for [Lumis](https://github.com/leandrocp/lumis), a syntax highlighter powered by Tree-sitter and Neovim themes.

The installed binary is `lumis`.

## Install

```sh
cargo install lumis-cli
```

## Commands

```text
lumis highlight          Highlight a file or stdin
lumis languages list     List supported language ids and file patterns
lumis themes list        List built-in themes and custom themes in the data dir
lumis themes generate    Extract a theme JSON file from a Neovim colorscheme repo
lumis parsers fetch      Pre-download parser WASM files
lumis parsers update     Re-download cached parser WASM files
```

## Highlight code

Terminal output is the default formatter.

```sh
# Highlight a file
lumis highlight src/main.rs

# Force a language when autodetection is wrong or unavailable
lumis highlight -l javascript snippet.txt

# Read from stdin
cat src/main.rs | lumis highlight -l rust
echo 'fn main() {}' | lumis highlight -l rust

# Pick a theme
lumis highlight -t dracula src/main.rs

# Reuse the theme background between styled spans
lumis highlight --theme dracula --background theme src/main.rs

# Pad terminal lines to a fixed width
lumis highlight -b '#282a36' -w 120 src/main.rs

# HTML with inline styles
lumis highlight -f html-inline -t github_dark src/main.rs

# HTML with CSS class names
lumis highlight -f html-linked src/main.rs

# HTML with multiple themes via CSS custom properties
lumis highlight -f html-multi-themes \
  --themes light:github_light \
  --themes dark:github_dark \
  --default-theme light \
  src/main.rs

# Change the CSS variable prefix for html-multi-themes
lumis highlight -f html-multi-themes \
  --themes light:github_light \
  --themes dark:github_dark \
  --css-variable-prefix --code \
  src/main.rs

# Apply the built-in terminal decorator
lumis highlight -d rainbow-brackets src/main.rs
```

Notes:

- `lumis highlight [PATH]` reads from stdin when `PATH` is omitted.
- If the detected language falls back to `plaintext`, the source is printed unchanged unless a decorator is applied.
- The default theme is `catppuccin_frappe` when a formatter needs a theme and you do not pass `--theme`.
- `--background` / `-b` applies only to terminal output. Omit it to inherit the output background, pass `theme` to reuse the theme background, or pass a hex color like `#282a36`.
- `--width` / `-w` applies only to terminal output. Pass a number or let it default to auto, which uses the current `COLUMNS` value when stdout is a TTY.
- `html-multi-themes` requires at least one `--themes name:theme_id` entry.

## Languages

List supported languages and the filename patterns used for autodetection:

```sh
lumis languages list
```

Examples of supported ids include `rust`, `javascript`, `typescript`, `tsx`, `elixir`, `heex`, `markdown`, `bash`, and many more.

## Themes

List built-in themes plus any `*.json` themes stored in the data directory:

```sh
lumis themes list
```

Generate a theme JSON file from a Neovim colorscheme repository:

```sh
# Print JSON to stdout
lumis themes generate -u https://github.com/catppuccin/nvim -c catppuccin-mocha

# Save JSON to a file
lumis themes generate -u https://github.com/folke/tokyonight.nvim -c tokyonight-night -o tokyonight.json

# Run setup Lua before loading the colorscheme
lumis themes generate \
  -u https://github.com/catppuccin/nvim \
  -c catppuccin-mocha \
  -s 'require("catppuccin").setup({ transparent_background = true })'

# Generate a light theme variant
lumis themes generate -u https://github.com/catppuccin/nvim -c catppuccin-latte -a light
```

`lumis themes generate` shells out to `nvim`, so Neovim must be installed and available on `PATH`.

## Parser management

Parser WASM files are downloaded on demand the first time a language is needed. You can also manage the cache explicitly.

```sh
# Download specific parsers ahead of time
lumis parsers fetch rust javascript elixir

# Download every supported parser
lumis parsers fetch --all

# Re-download specific cached parsers
lumis parsers update rust javascript

# Re-download all cached parsers
lumis parsers update --all

# Show cache paths while fetching or updating
lumis parsers fetch --verbose rust
lumis parsers update --verbose rust
```

Notes:

- `parsers fetch --all` downloads all supported parsers.
- `parsers update --all` only updates parsers already present in the cache.
- Injection highlighting works best when related parsers are already cached.

## Data directory

Lumis stores parser WASM files and custom theme JSON files in a local data directory.

| Platform | Default path |
|----------|--------------|
| macOS | `~/Library/Application Support/lumis/` |
| Linux | `~/.local/share/lumis/` |
| Windows | `%APPDATA%/lumis/` |

Contents:

- `parsers/` cached Tree-sitter WASM files
- `themes/` custom theme JSON files visible in `lumis themes list`

Override the location with `--data-dir` or `LUMIS_DATA_DIR`.

## Global options

```text
    --data-dir <PATH>   Override the data directory
 -V, --verbose          Show cache hits, downloads, and parser paths
    --help              Print help
-v, --version           Print version
```
