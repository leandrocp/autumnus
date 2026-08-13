# @lumis-sh/lumis

Syntax Highlighter powered by Tree-sitter and Neovim themes.

JavaScript/TypeScript package for [Lumis](https://lumis.sh). Works in Node.js, Bun, Deno, and browsers.

## Features

- **110+ Tree-sitter languages** - Fast, accurate, and updated syntax parsing
- **250+ built-in Neovim themes** - Updated and curated themes from the Neovim community
- **Built-in formatters** - HTML (inline/linked), Terminal (ANSI), Multi-theme (light/dark), BBCode
- **Custom formatters** - Build your own output
- **Language auto-detection** - File extension, shebang, and emacs-mode support
- **Line highlighting** - Mark and style individual lines, with custom HTML wrappers
- **Streaming-friendly** - Handles incomplete code
- **Load parsers on demand** - Verified and cached, including injected languages on Node; browsers load those up front

## Install

```sh
npm install @lumis-sh/lumis
npm install @lumis-sh/themes
```

## Usage

```typescript
import { highlight } from '@lumis-sh/lumis'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import javascript from '@lumis-sh/lumis/langs/javascript'
import dracula from '@lumis-sh/themes/dracula'

const html = await highlight('const x = 1', htmlInline({ language: javascript, theme: dracula }))
```

`highlight()` shares one process-wide runtime, which is what you want for a
one-off. For repeated calls, `createHighlighter()` loads languages during setup
and highlights synchronously afterwards:

```typescript
import { createHighlighter } from '@lumis-sh/lumis'

const hl = await createHighlighter({ languages: [javascript] })
const html = hl.highlight('const x = 1', htmlInline({ language: javascript, theme: dracula }))
```

Bundles register a whole set at once — `bundles/web`, `web-extra`, `system`,
`backend`, `full` — and each language in one still loads lazily on first use.

## Parsers

Each language import is a handle to an independently released parser package.
Lumis resolves it to an exact version, verifies the bytes against a SHA-256
digest before use, and caches them.

On Node, a document also loads the languages **injected inside** it during the
same pass, so a Markdown file with a fenced Rust block highlights that block
without Rust being named in your code. Browsers load asynchronously, so name
injected languages up front or use a bundle.

Prepare the cache in your application's startup lifecycle, before it begins
accepting requests:

```typescript
import { cacheLanguages } from '@lumis-sh/lumis/cache'

await cacheLanguages(['javascript', 'html', 'css'])
await startServer()
```

On native Node platforms this also validates the parsers and persists their
compiled Wasmtime modules. Use `lumis languages cache` when a separate CLI step
is preferable.

## Documentation

- [JavaScript runtime](https://lumis.sh/docs/usage/javascript-runtime) — runtimes, bundles, language handles
- [WASM and CDN](https://lumis.sh/docs/usage/wasm-and-cdn) — resolution, caching, custom resolvers
- [Formatters](https://lumis.sh/docs/usage/formatters) — every formatter and its options
- [Custom formatters](https://lumis.sh/docs/usage/custom-formatters)
- [Themes](https://lumis.sh/docs/usage/themes) and [CSS theme files](https://lumis.sh/docs/usage/css-theme-files)
- [Integrations](https://lumis.sh/docs/integrations/react) — React, Next.js, Astro, Nuxt, VitePress, rehype, markdown-it
- [Recipes](https://lumis.sh/docs/recipes)
