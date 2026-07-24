# Dynamic WASM runtime demos

These demos exercise every Lumis runtime in this repository that uses the
dynamic parser-WASM architecture:

- JavaScript on Node.js
- JavaScript in a browser
- Elixir

Each demo downloads the same pinned, SHA-256-verified
[Three.js WebGPU compute-reduction example](https://github.com/mrdoob/three.js/blob/6365c1a0af6a32ed45f99712197555fee2f4b24a/examples/webgpu_compute_reduce.html).
It is a real 1,397-line MIT-licensed file with substantial HTML and injected
CSS, JSON import-map, and JavaScript module scopes. All four parsers are loaded
before one `html-inline` highlighting call.

Rust's library API is not included because it compiles parsers natively. The
Java runtime lives in the separate `lumis4j` repository and does not use this
implementation.

Run every command from the repository root.

## Node.js

Build the local JavaScript packages, then generate an HTML page:

```sh
cd packages/javascript
pnpm --filter @lumis-sh/themes build
pnpm --filter @lumis-sh/lumis build
node ../../examples/wasm-runtimes/javascript/node.mjs
open ../../examples/wasm-runtimes/javascript/output.html
```

The first run downloads the source fixture and may download four parser WASMs.
Later processes reuse the
persistent platform cache. Set `LUMIS_WASM_CACHE_DIR` to inspect or isolate it.

## Browser

Build the packages as above, then start Vite:

```sh
cd packages/javascript/lumis
pnpm exec vite ../../../examples/wasm-runtimes/javascript/browser
```

Open the URL printed by Vite. Reload the page to verify that CacheStorage is
used after the first load.

## Elixir

```sh
elixir examples/wasm-runtimes/elixir/demo.exs
```

Open the localhost URL printed by Phoenix Playground. The single-file app uses
the local Lumis checkout, preloads all four parsers, and serves the highlighted
result with Phoenix LiveView. Set `LUMIS_WASM_CACHE_DIR` to inspect or isolate
the persistent parser and compiled Wasmtime caches.
