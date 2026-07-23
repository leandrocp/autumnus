# @lumis-sh/lumis-native

Opt-in native Node.js runtime for [`@lumis-sh/lumis`](https://www.npmjs.com/package/@lumis-sh/lumis).

```sh
npm install @lumis-sh/lumis @lumis-sh/lumis-native
```

No code changes are required. Lumis detects this package and uses the matching prebuilt addon automatically.

The native addon includes all supported language parsers, so it is much larger than the default per-language WASM runtime. Install it when native performance is worth the larger download.

Supported targets:

- macOS arm64 and x64
- Linux arm64 and x64 with glibc
- Windows x64

Unsupported platforms transparently continue using Lumis's default WASM runtime.
