import { defineConfig } from "vitepress";
import markdownItLumis from "@lumis-sh/markdown-it-lumis";
import { htmlInline } from "@lumis-sh/lumis/formatters";
import javascript from "@lumis-sh/wasm-javascript";
import rust from "@lumis-sh/wasm-rust";
import githubLight from "@lumis-sh/themes/github_light";

const install = await markdownItLumis({
  languages: [javascript, rust],
  formatter: (language) => htmlInline({ language, theme: githubLight }),
});

export default defineConfig({
  vite: { optimizeDeps: { exclude: ["@lumis-sh/wasm-javascript", "@lumis-sh/wasm-rust"] } },
  markdown: { config: (md) => md.use(install) },
});
