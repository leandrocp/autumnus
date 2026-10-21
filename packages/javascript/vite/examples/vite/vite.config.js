import { defineConfig } from "vite";
import lumis from "@lumis-sh/vite";
import { htmlMultiThemes } from "@lumis-sh/lumis/formatters";
import javascript from "@lumis-sh/wasm-javascript";
import githubDark from "@lumis-sh/themes/github_dark";
import githubLight from "@lumis-sh/themes/github_light";

export default defineConfig({
  optimizeDeps: { exclude: ["@lumis-sh/wasm-javascript"] },
  plugins: [
    lumis({
      languages: [javascript],
      formatter: (language) =>
        htmlMultiThemes({
          language,
          themes: { light: githubLight, dark: githubDark },
          defaultTheme: "light-dark()",
        }),
    }),
  ],
});
