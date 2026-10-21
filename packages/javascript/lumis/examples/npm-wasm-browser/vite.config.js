import { defineConfig } from "vite";
import packageJson from "./package.json" with { type: "json" };

export default defineConfig({
  optimizeDeps: {
    exclude: Object.keys(packageJson.dependencies).filter((name) =>
      name.startsWith("@lumis-sh/wasm-"),
    ),
  },
});
