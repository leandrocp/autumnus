# HTML examples

These browser demos are a standalone npm app.

Run these commands from this directory:

```bash
npm install
npm start
```

Then open the local Vite URL.

`npm run build` compiles every HTML demo into `dist/`. Parser packages are
explicit dependencies; browser demos import each language they use, including
injections. Only `custom-wasm-resolver.html` fetches its parser from a CDN.
