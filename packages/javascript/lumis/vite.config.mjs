import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["web-tree-sitter"],
  },
  test: {
    env: {
      // Most of the suite configures JavaScript resolvers, which belong to the
      // Wasm runtime; the native runtime resolves in Rust and has its own file.
      LUMIS_TEST_RUNTIME: process.env.LUMIS_TEST_RUNTIME ?? "wasm",
    },
  },
});
