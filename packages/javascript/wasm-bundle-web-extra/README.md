# @lumis-sh/wasm-bundle-web-extra

Static WASM imports for the web-extra Lumis bundle.

## Install

```sh
npm install @lumis-sh/lumis @lumis-sh/wasm-bundle-web-extra
```

## Node.js

Install this package alongside `@lumis-sh/lumis/bundles/web-extra` and Lumis will resolve the local parser packages automatically.

## Browser bundlers

```ts
import { createHighlighter, withWasmBundle } from '@lumis-sh/lumis'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web-extra'
import { bundledWasms } from '@lumis-sh/wasm-bundle-web-extra'

const languages = withWasmBundle(bundledLanguages, bundledWasms)
const highlighter = await createHighlighter({ languages: [languages] })
```
