# @lumis-sh/wasm-bundle-full

Lumis WASM full language bundle.

## Install

```sh
npm install @lumis-sh/lumis @lumis-sh/wasm-bundle-full
```

## Usage in Node.js

Install this package alongside `@lumis-sh/lumis/bundles/full` and Lumis will resolve the local parser packages automatically.

## Usage in browsers

```ts
import { createHighlighter, withWasmBundle } from '@lumis-sh/lumis'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/full'
import { bundledWasms } from '@lumis-sh/wasm-bundle-full'

const languages = withWasmBundle(bundledLanguages, bundledWasms)
const highlighter = await createHighlighter({ languages: [languages] })
```
