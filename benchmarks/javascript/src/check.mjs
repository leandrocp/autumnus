import { createHighlighter as createLumisHighlighter, withWasm } from "@lumis-sh/lumis";
import { htmlInline } from "@lumis-sh/lumis/formatters";
import rust from "@lumis-sh/lumis/langs/rust";
import githubDark from "@lumis-sh/themes/github_dark";
import rustWasm from "@lumis-sh/wasm-rust";
import { createHighlighter as createShikiHighlighter } from "shiki";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import { assertHtml, loadFixtures } from "./common.mjs";

const [small] = await loadFixtures();
const language = withWasm(rust, rustWasm);
const lumis = await createLumisHighlighter({ languages: [language] });
const lumisOutput = lumis.highlight(small.source, htmlInline({ language, theme: githubDark }));
assertHtml(lumisOutput, small.source.length, "Lumis JS");

const shiki = await createShikiHighlighter({
  langs: ["rust"],
  themes: ["github-dark"],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});
try {
  const shikiOutput = shiki.codeToHtml(small.source, { lang: "rust", theme: "github-dark" });
  assertHtml(shikiOutput, small.source.length, "Shiki");
  console.log(
    JSON.stringify({
      lumisOutputBytes: Buffer.byteLength(lumisOutput),
      shikiOutputBytes: Buffer.byteLength(shikiOutput),
    }),
  );
} finally {
  shiki.dispose();
}
