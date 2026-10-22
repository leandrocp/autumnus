import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: [
      "@lumis-sh/wasm-bundle-web",
      "@lumis-sh/wasm-css",
      "@lumis-sh/wasm-html",
      "@lumis-sh/wasm-javascript",
      "@lumis-sh/wasm-json",
      "@lumis-sh/wasm-tsx",
      "@lumis-sh/wasm-typescript",
    ],
  },
  build: { target: "esnext" },
});
