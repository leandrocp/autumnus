Run:

```bash
pnpm install
pnpm render
```

This Node example installs `@lumis-sh/wasm-bundle-essential` and uses `@lumis-sh/lumis/bundles/essential`.

`render.mjs` does not import the WASM bundle package directly. In Node, Lumis resolves the installed `@lumis-sh/wasm-*` parser packages automatically.

Open `output.html`.
