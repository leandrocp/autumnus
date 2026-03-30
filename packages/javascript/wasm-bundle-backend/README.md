# @lumis-sh/wasm-bundle-backend

Static WASM imports for the backend Lumis bundle.

## Install

```sh
npm install @lumis-sh/lumis @lumis-sh/wasm-bundle-backend
```

## Node.js

Install this package alongside `@lumis-sh/lumis/bundles/backend` and Lumis will resolve the local parser packages automatically.

## Browser bundlers

```ts
import { createHighlighter, withWasmBundle } from '@lumis-sh/lumis'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/backend'
import { bundledWasms } from '@lumis-sh/wasm-bundle-backend'

const languages = withWasmBundle(bundledLanguages, bundledWasms)
const highlighter = await createHighlighter({ languages: [languages] })
```


