# @lumis-sh/wasm-bundle-system

Static WASM imports for the system Lumis bundle.

## Install

```sh
npm install @lumis-sh/lumis @lumis-sh/wasm-bundle-system
```

## Node.js

Install this package alongside `@lumis-sh/lumis/bundles/system` and Lumis will resolve the local parser packages automatically.

## Browser bundlers

```ts
import { createHighlighter, withWasmBundle } from '@lumis-sh/lumis'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/system'
import { bundledWasms } from '@lumis-sh/wasm-bundle-system'

const languages = withWasmBundle(bundledLanguages, bundledWasms)
const highlighter = await createHighlighter({ languages: [languages] })
```

## Missing local packages

These languages currently fall back to Lumis's normal runtime resolution because compatible `@lumis-sh/wasm-*` packages are not published yet:

- `llvm`

