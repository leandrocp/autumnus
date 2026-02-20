# lumis-sh

Syntax Highlighter powered by Tree-sitter and Neovim themes.

JavaScript/TypeScript package for [Lumis](https://lumis.sh). Works in Node.js and browsers.

## Install

```sh
npm install lumis-sh
```

## Quick Start

```typescript
import { highlight, htmlInline } from 'lumis-sh'
import javascript from 'lumis-sh/langs/javascript'
import dracula from 'lumis-sh/themes/dracula'

const html = await highlight(
  'const x = 1',
  htmlInline({ lang: javascript, theme: dracula })
)
```

## API

Every function follows the same two-arg pattern:

```
highlight(source, formatter)
```

The **formatter** is a complete highlighting configuration — what to parse (`lang`), how to style (`theme`), what to output (`htmlInline`/`htmlLinked`/`terminal`), and how to decorate (`header`, `highlightLines`, etc.).

### Stateless (async)

Loads languages and themes on first use. Good for one-off highlighting.

```typescript
import { highlight, htmlInline } from 'lumis-sh'
import javascript from 'lumis-sh/langs/javascript'
import dracula from 'lumis-sh/themes/dracula'

const html = await highlight(
  'const x = 1',
  htmlInline({ lang: javascript, theme: dracula })
)
```

`lang` accepts a `LanguageBundle` (auto-loaded) or a pre-registered string id. `theme` accepts a `ThemeData` object (auto-registered) or a registered string name.

### Stateful (sync after init)

Pre-loads languages and themes upfront. Use this when highlighting multiple snippets — `hl.highlight()` is synchronous after initialization.

```typescript
import { createHighlighter, htmlInline } from 'lumis-sh'
import javascript from 'lumis-sh/langs/javascript'
import dracula from 'lumis-sh/themes/dracula'

const hl = await createHighlighter({
  langs: [javascript],
  themes: [dracula],
})

const html = hl.highlight('const x = 1', htmlInline({ lang: 'javascript', theme: 'dracula' }))
```

Load additional languages and themes after creation:

```typescript
import rust from 'lumis-sh/langs/rust'
import catppuccin_mocha from 'lumis-sh/themes/catppuccin_mocha'

await hl.loadLanguage(rust)
hl.loadTheme(catppuccin_mocha)
```

## Formatters

### `htmlInline` — HTML with inline styles

Self-contained HTML. No external CSS needed.

```typescript
import { htmlInline } from 'lumis-sh'

htmlInline({
  lang: 'javascript',
  theme: 'dracula',
  preClass: 'code-block',   // extra CSS class on <pre>
  italic: true,              // enable italic styles
  includeHighlights: true,   // add data-highlight attributes
  header: {                  // wrap output with custom HTML
    openTag: '<div class="wrapper">',
    closeTag: '</div>',
  },
})
```

### `htmlLinked` — HTML with CSS classes

Generates HTML with CSS class names. Requires external CSS for styling.

```typescript
import { htmlLinked } from 'lumis-sh'

htmlLinked({
  lang: 'javascript',
  preClass: 'code-block',
})
```

### `terminal` — ANSI escape codes

For CLI tools and terminal output.

```typescript
import { terminal } from 'lumis-sh'

terminal({
  lang: 'javascript',
  theme: 'dracula',
})
```

## Plaintext

Omitting `lang` or using `'plaintext'` renders escaped text with no syntax highlighting:

```typescript
hl.highlight('no syntax here', htmlInline({ theme: 'dracula' }))
hl.highlight('no syntax here', htmlInline({ lang: 'plaintext', theme: 'dracula' }))
```

Aliases `'text'`, `'txt'`, and `'plain'` also work.

## Formatter Reuse

Since `lang` is inside the formatter, use spread to reuse a base config across languages:

```typescript
const base = { theme: 'dracula', italic: true }

const jsHtml = hl.highlight(jsCode, htmlInline({ ...base, lang: 'javascript' }))
const rsHtml = hl.highlight(rsCode, htmlInline({ ...base, lang: 'rust' }))
```

## Browser Usage

Works with Vite, webpack, and other bundlers. The tree-sitter parser WASM is inlined as base64 — no file resolution or CORS issues. Language WASM files are resolved automatically via `import.meta.url`.

## Languages

Languages are self-contained bundles imported from `lumis-sh/langs/*`. Each bundle includes the tree-sitter WASM parser and highlight queries — explicit imports, fully tree-shakeable.

Available: `javascript`, `rust`, `json`, `plaintext` (more coming).

## Themes

117 themes from popular Neovim colorschemes, imported from `lumis-sh/themes/*`.

Includes Catppuccin, Dracula, GitHub, Gruvbox, Tokyo Night, One Dark, Rose Pine, Nord, Material, Kanagawa, and many more.

## License

MIT
