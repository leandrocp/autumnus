import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import rehypeLumis from "@lumis-sh/rehype-lumis";
import { htmlInline } from "@lumis-sh/lumis/formatters";
import javascript from "@lumis-sh/wasm-javascript";
import rust from "@lumis-sh/wasm-rust";
import githubLight from "@lumis-sh/themes/github_light";

export default defineConfig({
  vite: { optimizeDeps: { exclude: ["@lumis-sh/wasm-javascript", "@lumis-sh/wasm-rust"] } },
  markdown: { syntaxHighlight: false },
  integrations: [
    mdx({
      rehypePlugins: [
        [
          rehypeLumis,
          {
            formatter: (language) => htmlInline({ language, theme: githubLight }),
            languages: [javascript, rust],
          },
        ],
      ],
    }),
  ],
});
