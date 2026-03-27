# @lumis-sh/lumis

Syntax Highlighter powered by Tree-sitter and Neovim themes.

JavaScript/TypeScript package for [Lumis](https://lumis.sh). Works in Node.js and browsers.

Uses `web-tree-sitter` for parsing.

Parser `.wasm` files are runtime assets. By default, Lumis fetches versioned parser WASM packages from jsDelivr on demand and caches them locally in Node.

## Install

```sh
npm install @lumis-sh/lumis
```

Themes are published separately:

```sh
npm install @lumis-sh/themes
```

## Quick Start

The fastest way to highlight code. The stateless `highlight()` function initializes the parser, loads the language, and returns HTML in a single async call.

```typescript
import { highlight } from '@lumis-sh/lumis'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import javascript from '@lumis-sh/lumis/langs/javascript'
import dracula from '@lumis-sh/themes/dracula'

const html = await highlight(
  'const x = 1',
  htmlInline({ language: javascript, theme: dracula })
)
```

`highlight()` uses a shared default runtime. It is convenient for one-off calls, but loaded languages and WASM resolver configuration are shared process-wide.

## Reuse A Highlighter

Use `createHighlighter()` when you want to preload languages and highlight synchronously after setup.

```typescript
import { createHighlighter } from '@lumis-sh/lumis'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import javascript from '@lumis-sh/lumis/langs/javascript'
import dracula from '@lumis-sh/themes/dracula'

const hl = await createHighlighter({ languages: [javascript] })

// hl.highlight() is synchronous, languages are already loaded
const html = hl.highlight(
  'const x = 1',
  htmlInline({ language: javascript, theme: dracula })
)
```

Use `createHighlighter()` when you want explicit control over loaded languages, isolation between highlighters, or better throughput for repeated calls.

## Bundles

Bundles group languages into sets. Each language loads lazily on first use, so registering a bundle with 110+ languages costs almost nothing upfront.

Three bundles ship with lumis:

| Bundle | Languages | Use case |
|--------|-----------|----------|
| `bundles/web` | 23 | HTML, CSS, JS, TS, JSON, Markdown, SQL, Svelte, Vue, Astro, and other web essentials |
| `bundles/system` | 18 | C, C++, Rust, Go, Zig, ASM, LLVM, CMake, Make |
| `bundles/full` | 77 | Every supported language |

### Using a bundle

Pass the bundle to `createHighlighter()`. Languages register lazily and load on first `loadLanguage()` call.

```typescript
import { createHighlighter } from '@lumis-sh/lumis'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
import dracula from '@lumis-sh/themes/dracula'

const hl = await createHighlighter({ languages: [bundledLanguages] })

// Load a language before highlighting
await hl.loadLanguage('javascript')
const html = hl.highlight(
  'const x = 1',
  htmlInline({ language: 'javascript', theme: dracula })
)
```

### Using bundle handles

Each entry in a bundle is a `LazyLanguage` handle. You can pass it to formatters and `loadLanguage()` instead of using strings.

```typescript
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'

const hl = await createHighlighter({ languages: [bundledLanguages] })
await hl.loadLanguage(bundledLanguages.javascript)

const html = hl.highlight(
  'const x = 1',
  htmlInline({ language: bundledLanguages.javascript, theme: dracula })
)
```

### Mixing bundles and individual languages

`createHighlighter()` accepts any combination of `Language` objects, bundles, and dynamic imports.

```typescript
import { createHighlighter } from '@lumis-sh/lumis'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/system'
import elixir from '@lumis-sh/lumis/langs/elixir'

const hl = await createHighlighter({
  languages: [
    elixir,                                    // loaded immediately
    bundledLanguages,                          // registered lazily
    import('@lumis-sh/lumis/langs/python'),     // loaded immediately via dynamic import
  ],
})
```

### Checking registered vs loaded languages

```typescript
const hl = await createHighlighter({ languages: [bundledLanguages] })

hl.registeredLanguages  // all languages in the bundle (including lazy)
hl.languages            // only languages that have been loaded
```

## Language References

Formatters and `hl.highlight()` accept several forms for specifying a language.

```typescript
import json from '@lumis-sh/lumis/langs/json'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'

// Language object
hl.highlight(code, htmlInline({ language: json, theme }))

// LazyLanguage handle from a bundle
hl.highlight(code, htmlInline({ language: bundledLanguages.json, theme }))

// String ID (must be loaded or registered in a bundle)
hl.highlight(code, htmlInline({ language: 'json', theme }))
```

All three are equivalent at highlight time. The runtime resolves the language by its ID.

## Runtime WASM Behavior

- `@lumis-sh/lumis` ships the JS API and embedded `web-tree-sitter` runtime WASM.
- Language parsers are separate versioned `.wasm` assets loaded at runtime.
- By default, Lumis resolves parser WASM from `https://cdn.jsdelivr.net/npm/@lumis-sh/wasm-<parser-name-without-tree-sitter-prefix>@<tree-sitter-version>/<parser>.wasm`.
- The `<tree-sitter-version>` segment is a partial version such as `0.26`, which CDNs resolve to the latest compatible patch release.
- In Node, fetched parser WASM files are cached under `node_modules/.cache/lumis` when possible.
- In restricted or offline environments, set a custom resolver before calling `highlight()` or `createHighlighter()`.

## Output Formats

- `htmlInline()` for self-contained HTML with inline styles
- `htmlLinked()` for class-based HTML that uses external CSS
- `htmlMultiThemes()` for light/dark or multi-theme HTML with CSS variables
- `terminal()` for ANSI-colored terminal output
- `bbcodeScoped()` for nested BBCode tags using highlight scope names
- custom formatter objects via `@lumis-sh/lumis/formatters`

```typescript
import { bbcodeScoped } from '@lumis-sh/lumis/formatters'
import javascript from '@lumis-sh/lumis/langs/javascript'

const output = hl.highlight('const x = "[url=x]"', bbcodeScoped({ language: javascript }))
// [keyword-javascript]const[/keyword-javascript] x = [string-javascript]"&#91;url=x&#93;"[/string-javascript]
```

`bbcodeScoped()` emits highlight scope names as tags, not standard forum-style BBCode like `[b]`, `[color]`, or `[code]`.

## Custom Formatters

A formatter is an object with `language` and `format(source, hl)`. Inside `format()`, call `hl.highlightIter()` to iterate over highlighted tokens. Built-in formatters are regular objects. Custom ones work the same way.

Minimal example that wraps each token in a colored `<span>`:

```typescript
import { createHighlighter } from '@lumis-sh/lumis'
import type { Formatter } from '@lumis-sh/lumis/formatters'
import { openPreTag, openCodeTag, closingTags, spanInline } from '@lumis-sh/lumis/formatters/html'
import rust from '@lumis-sh/lumis/langs/rust'
import dracula from '@lumis-sh/themes/dracula'

const hl = await createHighlighter({ languages: [rust] })

const formatter: Formatter = {
  language: rust,
  format(source, hl) {
    const parts: string[] = []

    parts.push(openPreTag({ theme: dracula }))
    parts.push(openCodeTag(rust))

    hl.highlightIter(source, rust, dracula, (text, language, _range, scope, _style) => {
      if (scope) {
        parts.push(spanInline(text, { language, scope, theme: dracula }))
      } else {
        parts.push(text)
      }
    })

    parts.push(closingTags())
    return parts.join('')
  },
}

const html = hl.highlight('fn main() {}', formatter)
```

HTML helpers (`@lumis-sh/lumis/formatters/html`):

```typescript
import {
  escape, escapeBraces,
  openPreTag, openCodeTag, closePreTag, closeCodeTag, closingTags,
  wrapLine, scopeToClass, textDecoration,
  spanInline, spanInlineAttrs, spanLinked, spanLinkedAttrs,
  spanMultiThemes, spanMultiThemesAttrs,
} from '@lumis-sh/lumis/formatters/html'
```

ANSI helpers (`@lumis-sh/lumis/formatters/ansi`):

```typescript
import { hexToRgb, rgbToAnsi, styleToAnsi, wrapWithAnsi } from '@lumis-sh/lumis/formatters/ansi'
```

## Custom WASM Resolution

Override the resolver when you want to serve parser WASM files yourself, switch CDNs, or avoid network fetches in locked-down environments:

```typescript
import { configureWasmResolver } from '@lumis-sh/lumis'

configureWasmResolver((_language, wasm) =>
  `https://unpkg.com/${wasm.packageName}@${wasm.version}/${wasm.name}.wasm`
)
```

This can be called at any time. It applies to `highlight()`, `createHighlighter()`, and any existing highlighter instances.

For advanced use cases that need isolated resolution (e.g., tests, multiple CDNs), pass `wasmResolver` directly to `createHighlighter()`.

## `htmlLinked()` CSS

`htmlLinked()` emits semantic classes instead of inline styles. Include a theme stylesheet on the page, for example:

```typescript
import '@lumis-sh/themes/css/dracula.css'
```
