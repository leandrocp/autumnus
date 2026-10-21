import { htmlInline } from "@lumis-sh/lumis/formatters";
import javascript from "@lumis-sh/wasm-javascript";
import rust from "@lumis-sh/wasm-rust";
import githubLight from "@lumis-sh/themes/github_light";

export default defineNuxtConfig({
  vite: { optimizeDeps: { exclude: ["@lumis-sh/wasm-javascript", "@lumis-sh/wasm-rust"] } },
  modules: ["@nuxt/content"],
  content: {
    build: {
      markdown: {
        highlight: false,
        rehypePlugins: {
          "@lumis-sh/rehype-lumis": {
            options: {
              formatter: (language) => htmlInline({ language, theme: githubLight }),
              languages: [javascript, rust],
            },
          },
        },
      },
    },
  },
});
