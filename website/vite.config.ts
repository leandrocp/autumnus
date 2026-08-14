import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    // Every parser's `lumis.json` is reachable from the worker, but a visit
    // needs the handful of languages it actually highlights. Most are under the
    // 4 kB default, so inlining put 46 of them in the worker chunk as base64 and
    // grew it by 171 kB that every visitor downloads to use a few. Emitted as
    // files, they are fetched only by the language that names one.
    assetsInlineLimit: (filePath: string) => (filePath.endsWith("lumis.json") ? false : undefined),
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("index.html", import.meta.url)),
        comparison: fileURLToPath(new URL("comparison/index.html", import.meta.url)),
        showcase: fileURLToPath(new URL("showcase/index.html", import.meta.url)),
      },
    },
  },
  worker: {
    format: "es",
  },
  server: {
    host: "0.0.0.0",
    port: 4321,
  },
});
