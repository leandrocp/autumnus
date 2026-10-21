import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import packageJson from "./package.json" with { type: "json" };

export default defineConfig({
  optimizeDeps: {
    exclude: Object.keys(packageJson.dependencies).filter((name) =>
      name.startsWith("@lumis-sh/wasm-"),
    ),
  },
  build: {
    rolldownOptions: {
      input: readdirSync(new URL(".", import.meta.url))
        .filter((name) => name.endsWith(".html"))
        .map((name) => fileURLToPath(new URL(name, import.meta.url))),
    },
  },
});
