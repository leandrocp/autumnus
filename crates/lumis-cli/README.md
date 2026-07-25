# lumis-cli

CLI for [Lumis](https://github.com/leandrocp/lumis), a syntax highlighter powered by Tree-sitter and Neovim themes.

The installed binary is `lumis`.

## Install

Without a Rust toolchain:

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
lumis parsers cache      Cache parser WASM files for later or offline use
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

# Highlight specific lines
lumis highlight -h 1,3-5,10 src/main.rs
```

Notes:

- `lumis highlight [PATH]` reads from stdin when `PATH` is omitted.
- If the detected language falls back to `plaintext`, the source is printed unchanged.
- The default theme is read from `[highlight].theme` in the configuration file. Use `auto` (also the default when unset) to query the terminal background and choose the built-in theme with the closest background color. If detection is unavailable, Lumis renders without a theme; `--theme` takes precedence over the configuration file.
- `--background` / `-b` applies only to terminal output. Omit it to inherit the output background, pass `theme` to reuse the theme background, or pass a hex color like `#282a36`.
- `--width` / `-w` applies only to terminal output. Pass a number or let it default to auto, which uses the current `COLUMNS` value when stdout is a TTY.
- `html-multi-themes` requires at least one `--themes name:theme_id` entry.

## Inspect Tree-sitter output

Use `dump tree` to print named syntax nodes as branch lines with languages and
ranges. Add source text, resolved highlights, and injected language trees only
when needed. `--text` shows an 80-character middle preview; use `--text=<limit>`
or `--text=full` to adjust it. Syntax nodes use `[name]`; resolved highlights
use `@name`. Use the S-expression format for canonical parser output:

```sh
lumis dump tree src/main.js
lumis dump tree component.svelte --text
lumis dump tree component.svelte --injections --highlights
lumis dump tree src/main.js --format sexp
lumis dump events src/main.js
```

See the
[CLI command reference](https://lumis.sh/docs/cli/commands#lumis-dump-tree)
for output details.

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

## Configuration

Set defaults in `config.toml`:

```toml
[highlight]
theme = "auto" # or a theme name such as "tokyonight_moon"
```

The `--theme` command-line option takes precedence over the configured theme.

| Platform | Default path |
| ---------- | -------------- |
| macOS | `~/.config/lumis/config.toml` |
| Linux | `${XDG_CONFIG_HOME:-~/.config}/lumis/config.toml` |
| Windows | `%XDG_CONFIG_HOME%/lumis/config.toml`, `%APPDATA%/lumis/config.toml` otherwise |

Override the location with `--config` or `LUMIS_CONFIG`.

## Parser management

Parser WASM files are downloaded on demand the first time a language is needed.
Every URL uses the exact generated manifest version, and cached filenames
include the version and SHA-256 digest. Corrupt bytes are rejected before use.
You can also prepare the cache explicitly.

```sh
# Cache specific parsers
lumis parsers cache rust javascript elixir

# Cache every supported parser
lumis parsers cache --all

# Replace valid cached parsers
lumis parsers cache rust javascript --force

# Show cache paths and downloads
lumis parsers cache --verbose rust
```

Notes:

- `parsers cache --all` caches all supported parsers.
- `--force` replaces valid cached parsers instead of reusing them.
- Injection highlighting works best when related parsers are already cached.

## Data directory

Lumis stores parser WASM files and custom theme JSON files in a local data directory.

| Platform | Default path |
| ---------- | -------------- |
| macOS | `~/Library/Application Support/lumis/` |
| Linux | `~/.local/share/lumis/` |
| Windows | `%APPDATA%/lumis/` |

Contents:

- `parsers/` verified, content-addressed Tree-sitter WASM files
- `themes/` custom theme JSON files visible in `lumis themes list`

Override the location with `--data-dir` or `LUMIS_DATA_DIR`.

## Global options

```text
-d, --data-dir <PATH>   Override the data directory
    --config <PATH>     Override the configuration file
 -V, --verbose          Show cache hits, downloads, and parser paths
    --help              Print help
-v, --version           Print version
```
