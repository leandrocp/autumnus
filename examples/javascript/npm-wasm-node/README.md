Run:

```bash
pnpm install
pnpm render
```

This is the optimized Node example. It installs `@lumis-sh/wasm-elixir`, but `render.mjs` only imports `@lumis-sh/lumis/langs/elixir`.

In Node, Lumis can detect the installed `@lumis-sh/wasm-elixir` package and load its WASM automatically, so no manual `wasm` override is needed.

Open `output.html`.
