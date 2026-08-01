# @lumis-sh/lumis-native

Native Node.js runtime for [`@lumis-sh/lumis`](https://www.npmjs.com/package/@lumis-sh/lumis).

```sh
npm install @lumis-sh/lumis @lumis-sh/lumis-native
```

`@lumis-sh/lumis` already declares the per-platform addons as optional dependencies, so most installs get this without asking. Install it explicitly when a package manager has been told to skip optional dependencies.

The addon carries no parsers. It runs the same Wasmtime-backed highlighting the Lumis CLI and the Elixir bindings use, downloading and caching each parser WASM on first use, so it is about 11 MiB per platform rather than one binary per language.

Supported targets:

- macOS arm64 and x64
- Linux arm64 and x64 with glibc
- Windows x64

Unsupported platforms transparently continue using Lumis's `web-tree-sitter` runtime.
