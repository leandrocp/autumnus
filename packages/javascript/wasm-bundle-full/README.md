# @lumis-sh/wasm-bundle-full

Static WASM imports for the full Lumis bundle.

## Install

```sh
npm install @lumis-sh/lumis @lumis-sh/wasm-bundle-full
```

## Node.js

Install this package alongside `@lumis-sh/lumis/bundles/full` and Lumis will resolve the local parser packages automatically.

## Browser bundlers

```ts
import { createHighlighter, withWasmBundle } from '@lumis-sh/lumis'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/full'
import { bundledWasms } from '@lumis-sh/wasm-bundle-full'

const languages = withWasmBundle(bundledLanguages, bundledWasms)
const highlighter = await createHighlighter({ languages: [languages] })
```

## Missing local packages

These languages currently fall back to Lumis's normal runtime resolution because compatible `@lumis-sh/wasm-*` packages are not published yet:

- `llvm`
- `gitcommit`
- `kitty`
- `tmux`
- `zsh`

