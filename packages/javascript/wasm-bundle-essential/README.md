# @lumis-sh/wasm-bundle-essential

Static WASM imports for the essential Lumis bundle.

## Install

```sh
npm install @lumis-sh/lumis @lumis-sh/wasm-bundle-essential
```

## Node.js

Install this package alongside `@lumis-sh/lumis/bundles/essential` and Lumis will resolve the local parser packages automatically.

## Browser bundlers

```ts
import { createHighlighter, withWasmBundle } from '@lumis-sh/lumis'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/essential'
import { bundledWasms } from '@lumis-sh/wasm-bundle-essential'

const languages = withWasmBundle(bundledLanguages, bundledWasms)
const highlighter = await createHighlighter({ languages: [languages] })
```


