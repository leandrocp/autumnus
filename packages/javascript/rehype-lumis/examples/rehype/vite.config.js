import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: { exclude: ["@lumis-sh/wasm-javascript", "@lumis-sh/wasm-rust"] },
  build: { target: "esnext" },
});
