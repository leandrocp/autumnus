# @lumis-sh/wasm-bundle-web

Lumis WASM web language bundle.

## Install

```sh
npm install @lumis-sh/lumis @lumis-sh/wasm-bundle-web
```

## Usage in Node.js

Install this package alongside `@lumis-sh/lumis/bundles/web` and Lumis will resolve the local parser packages automatically.

## Usage in browsers

```ts
import { createHighlighter, withWasmBundle } from '@lumis-sh/lumis'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
import { bundledWasms } from '@lumis-sh/wasm-bundle-web'

const languages = withWasmBundle(bundledLanguages, bundledWasms)
const highlighter = await createHighlighter({ languages: [languages] })
```
