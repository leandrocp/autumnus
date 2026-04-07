# @lumis-sh/wasm-bundle-backend

Lumis WASM backend language bundle.

## Install

```sh
npm install @lumis-sh/lumis @lumis-sh/wasm-bundle-backend
```

## Usage in Node.js

Install this package alongside `@lumis-sh/lumis/bundles/backend` and Lumis will resolve the local parser packages automatically.

## Usage in browsers

```ts
import { createHighlighter, withWasmBundle } from '@lumis-sh/lumis'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/backend'
import { bundledWasms } from '@lumis-sh/wasm-bundle-backend'

const languages = withWasmBundle(bundledLanguages, bundledWasms)
const highlighter = await createHighlighter({ languages: [languages] })
```
