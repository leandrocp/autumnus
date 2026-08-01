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

- 🌳 110+ languages with tree-sitter parsing
- 🎨 250+ built-in Neovim themes
- 📝 HTML output with inline styles or CSS classes
- 🖥️ Terminal output with ANSI colors
- 🔍 Language auto-detection
- 🎯 Customizable formatting options
- ✨ Line highlighting with custom styling
- 🎁 Custom HTML wrappers for code blocks

## Installation

```elixir
def deps do
  [
    {:lumis, "~> 0.3"}
  ]
end
```

## Parser WASM

Nothing loads implicitly: highlighting a language you have not loaded raises,
and a language injected inside a document is left unhighlighted unless it was
loaded too. Each `@lumis-sh/wasm-*` language package contains the parser,
matching queries, and integrity metadata. Lumis caches the package metadata,
then loads and verifies the exact parser version it names. Parser and query
updates do not require a new Elixir package release.

Load expected languages before serving requests:

```elixir
:ok = Lumis.Languages.load(["elixir", "html", "javascript", "css"])
```

For OTP releases, cache the exact parsers in the release-local `priv/wasm`
directory at build time:

```sh
MIX_ENV=prod mix do compile, lumis.languages.cache, release
```

The runtime checks release-local assets first, then the persistent user cache.
Missing metadata resolves to the current language package; missing parser bytes
resolve to its exact CDN URL. Wasmtime also persists compiled modules, so a
later VM start does not have to compile the same parser again.

Set `LUMIS_DATA_DIR` to override the cache location. Custom
resolvers can return bytes, a local file, or a URL:

```elixir
config :lumis, :language_package_resolver, fn language ->
  {:file, Path.join("/app/wasm", "#{Path.basename(language.package_name)}.language.json")}
end

config :lumis, :wasm_resolver, fn parser ->
  {:file, Path.join("/app/wasm", "#{parser.wasm_name}.wasm")}
end
```

## Usage

### Basic Usage (HTML Inline)

```elixir
iex> Lumis.highlight!("Atom.to_string(:elixir)", formatter: {:html_inline, language: "elixir"})
~s|<pre class="lumis" style="color: #abb2bf; background-color: #282c34;"><code class="language-elixir" translate="no" tabindex="0"><div class="l-line" data-line="1"><span style="color: #e5c07b;">Atom</span><span style="color: #56b6c2;">.</span><span style="color: #61afef;">to_string</span><span style="color: #c678dd;">(</span><span style="color: #e06c75;">:elixir</span><span style="color: #c678dd;">)</span>
</span></code></pre>|
```

See the HTML Linked and Terminal formatters below for more options.

### Language Auto-detection

```elixir
iex> Lumis.highlight!("#!/usr/bin/env bash\nID=1")
~s|<pre class="lumis" style="color: #abb2bf; background-color: #282c34;"><code class="language-bash" translate="no" tabindex="0"><div class="l-line" data-line="1"><span style="color: #c678dd;">#!/usr/bin/env bash</span>
</div><div class="l-line" data-line="2"><span style="color: #d19a66;">ID</span><span style="color: #56b6c2;">=</span><span style="color: #d19a66;">1</span>
</span></code></pre>|
```

### Themes

Themes are sourced from popular Neovim colorschemes.

Use `Lumis.available_themes/0` to list all available themes. You can specify a theme by name in the formatter options, or use `Lumis.Theme.get/1` to get a specific theme struct if you need to inspect or manipulate its styles.

```elixir
# Using theme name in formatter options
iex> Lumis.highlight!("setTimeout(fun, 5000);", formatter: {:html_inline, language: "js", theme: "github_light"})
~s|<pre class="lumis" style="color: #1f2328; background-color: #ffffff;"><code class="language-javascript" translate="no" tabindex="0"><div class="l-line" data-line="1"><span style="color: #6639ba;">setTimeout</span><span style="color: #1f2328;">(</span><span style="color: #1f2328;">fun</span><span style="color: #1f2328;">,</span> <span style="color: #0550ae;">5000</span><span style="color: #1f2328;">)</span><span style="color: #1f2328;">;</span>
</span></code></pre>|

# Using theme struct
iex> theme = Lumis.Theme.get("github_light")
iex> Lumis.highlight!("setTimeout(fun, 5000);", formatter: {:html_inline, language: "js", theme: theme})
```

#### Bring Your Own Theme

You can also load custom themes from JSON files or strings:

```elixir
# Load from JSON file
{:ok, theme} = Lumis.Theme.from_file("/path/to/your/theme.json")
Lumis.highlight!("your code", theme: theme)

# Load from JSON string
theme_json = ~s({"name": "my_theme", "appearance": "dark", "highlights": {"comment": {"fg": "#808080"}}})
{:ok, theme} = Lumis.Theme.from_json(theme_json)
Lumis.highlight!("your code", theme: theme)
```

## Incomplete or Malformed code

It's also capable of handling incomplete or malformed code, useful for streaming like in a ChatGPT interface:

```elixir
iex> Lumis.highlight!("const header = document.getEl", formatter: {:html_inline, language: "js"})
~s|<pre class="lumis" style="color: #abb2bf; background-color: #282c34;"><code class="language-javascript" translate="no" tabindex="0"><div class="l-line" data-line="1"><span style="color: #c678dd;">const</span> <span style="color: #abb2bf;">header</span> <span style="color: #abb2bf;">=</span> <span style="color: #e86671;">document</span><span style="color: #848b98;">.</span><span style="color: #56b6c2;">getEl</span>
</span></code></pre>|
```

## Formatters

Lumis supports five output formatters:

All HTML formatters wrap each line in a `<div class="l-line">` element with a `data-line` attribute containing the line number, making it easy to add line numbers or implement line-based features in your application.

See the [package examples](https://github.com/leandrocp/lumis/tree/main/packages/elixir/lumis/examples) and [t:formatter/0](https://hexdocs.pm/lumis/Lumis.html#t:formatter/0) for more.

### HTML Inline (Default)

Generates HTML with inline styles for each token:

```elixir
iex> Lumis.highlight!("Atom.to_string(:elixir)", formatter: {:html_inline, language: "elixir"})
# or with options
iex> Lumis.highlight!("Atom.to_string(:elixir)", formatter: {:html_inline, language: "elixir", pre_class: "my-code", italic: true, include_highlights: true})
```

Options:
- `:pre_class` - CSS class for the `<pre>` tag
- `:italic` - enable italic styles
- `:include_highlights` - include highlight scope names in `data-highlight` attributes
- `:highlight_lines` - highlight specific lines with custom styling
- `:header` - wrap the highlighted code with custom HTML elements

### HTML Linked

Generates HTML with CSS classes for styling:

```elixir
iex> Lumis.highlight!("Atom.to_string(:elixir)", formatter: {:html_linked, language: "elixir"})
# or with options
iex> Lumis.highlight!("Atom.to_string(:elixir)", formatter: {:html_linked, language: "elixir", pre_class: "my-code"})
```

Options:
- `:pre_class` - CSS class for the `<pre>` tag
- `:highlight_lines` - highlight specific lines with custom CSS class
- `:header` - wrap the highlighted code with custom HTML elements

To use linked styles, you need to include one of the [available CSS themes](https://github.com/leandrocp/lumis/tree/main/priv/static/css) in your app.

For Phoenix apps, add this to your `endpoint.ex`:

```elixir
plug Plug.Static,
  at: "/themes",
  from: {:lumis, "priv/static/css/"},
  only: ["dracula.css"] # choose any theme you want
```

Then add the stylesheet to your template:

```html
<link phx-track-static rel="stylesheet" href={~p"/themes/dracula.css"} />
```

CSS theme files are available in `priv/static/css/`. Use `Lumis.Theme.build_css/2` for custom selectors or embedded CSS ([docs](https://lumis.sh/docs/themes/css-builder)).

### HTML Multi-Themes

Generates HTML with CSS custom properties (variables) for multiple themes, enabling light/dark mode support. Inspired by [Shiki Dual Themes](https://shiki.style/guide/dual-themes).

```elixir
# Basic dual theme with CSS variables
iex> Lumis.highlight!("Atom.to_string(:elixir)",
  formatter: {:html_multi_themes,
    language: "elixir",
    themes: [light: "github_light", dark: "github_dark"]
  }
)

# With light-dark() function for automatic theme switching
iex> Lumis.highlight!("Atom.to_string(:elixir)",
  formatter: {:html_multi_themes,
    language: "elixir",
    themes: [light: "github_light", dark: "github_dark"],
    default_theme: "light-dark()"
  }
)
```

The generated HTML includes CSS custom properties like `--lumis-light`, `--lumis-dark`, `--lumis-{theme}-bg`, and font styling variables (`-font-style`, `-font-weight`, `-text-decoration`) that can be used with CSS media queries or JavaScript for theme switching:

```css
/* Automatic light/dark mode based on system preference */
@media (prefers-color-scheme: dark) {
  .lumis,
  .lumis span {
    color: var(--lumis-dark) !important;
    background-color: var(--lumis-dark-bg) !important;
    font-style: var(--lumis-dark-font-style) !important;
    font-weight: var(--lumis-dark-font-weight) !important;
    text-decoration: var(--lumis-dark-text-decoration) !important;
  }
}

/* Manual control with class-based switching */
html.dark .lumis,
html.dark .lumis span {
  color: var(--lumis-dark) !important;
  background-color: var(--lumis-dark-bg) !important;
  font-style: var(--lumis-dark-font-style) !important;
  font-weight: var(--lumis-dark-font-weight) !important;
  text-decoration: var(--lumis-dark-text-decoration) !important;
}
```

Options:
- `:themes` (required) - keyword list mapping theme identifiers to theme names, e.g., `[light: "github_light", dark: "github_dark"]`
- `:default_theme` - controls inline color rendering: theme identifier for inline colors, `"light-dark()"` for CSS function, or `nil` for CSS variables only
- `:css_variable_prefix` - custom CSS variable prefix (default: `"--lumis"`)
- `:pre_class` - CSS class for the `<pre>` tag
- `:italic` - enable italic styles
- `:include_highlights` - include highlight scope names in `data-highlight` attributes
- `:highlight_lines` - highlight specific lines with custom styling
- `:header` - wrap the highlighted code with custom HTML elements

### Terminal

Generates ANSI escape codes for terminal output:

```elixir
iex> Lumis.highlight!("Atom.to_string(:elixir)", formatter: {:terminal, language: "elixir"})
# or with options
iex> Lumis.highlight!("Atom.to_string(:elixir)", formatter: {:terminal, language: "elixir", theme: "github_light"})
iex> Lumis.highlight!("Atom.to_string(:elixir)", formatter: {:terminal, language: "elixir", theme: "dracula", background: :theme, width: 120})
```

Options:
- `:theme` - theme to apply styles
- `:background` - fallback terminal background: `nil`, `:theme`, or a hex color string
- `:width` - pad each rendered line to a fixed width when a fallback background is active

### BBCode Scoped

Generates nested BBCode tags using highlight scope names:

```elixir
iex> Lumis.highlight!("Atom.to_string(:elixir)", formatter: {:bbcode_scoped, language: "javascript"})
```

This formatter emits highlight scope names as tags, not standard forum-style BBCode like `[b]`, `[color]`, or `[code]`.

## Samples

Visit https://lumis.sh to check out some examples.

## Acknowledgements

* [Makeup](https://hex.pm/packages/makeup) for setting up the baseline and for the inspiration
* [Inkjet](https://crates.io/crates/inkjet) for the Rust implementation up to v0.2 and for the inspiration
