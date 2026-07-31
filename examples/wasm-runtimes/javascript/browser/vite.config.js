import { defineConfig } from "vite";

// The demo highlights the Three.js fixture vendored at the repository root, so
// Vite needs permission to read outside this directory.
export default defineConfig({
  server: { fs: { allow: ["../../../.."] } },
});
