import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import highlightJs from "highlight.js";
import { createHighlighter as createShikiHighlighter } from "shiki";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import { createHighlighter, withWasm } from "@lumis-sh/lumis";
import { htmlInline } from "@lumis-sh/lumis/formatters";
import comment from "@lumis-sh/lumis/langs/comment";
import css from "@lumis-sh/lumis/langs/css";
import html from "@lumis-sh/lumis/langs/html";
import javascript from "@lumis-sh/lumis/langs/javascript";
import json from "@lumis-sh/lumis/langs/json";
import theme from "@lumis-sh/themes/dracula";
import commentWasm from "@lumis-sh/wasm-comment";
import cssWasm from "@lumis-sh/wasm-css";
import htmlWasm from "@lumis-sh/wasm-html";
import javascriptWasm from "@lumis-sh/wasm-javascript";
import jsonWasm from "@lumis-sh/wasm-json";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const generatedDir = resolve(benchmarksDir, "showcase/generated");
const source = await readFile(resolve(generatedDir, "assets/webgpu_compute_reduce.html"), "utf8");
const localPackages = JSON.parse(
  await readFile(
    resolve(benchmarksDir, "../target/benchmarks/language-packages/index.json"),
    "utf8",
  ),
);
const languagePackageResolver = (packageName) => {
  const local = localPackages[packageName];
  if (!local) throw new Error(`missing local language package ${packageName}`);
  return pathToFileURL(local.metadataPath);
};
const languages = [
  withWasm(html, htmlWasm),
  withWasm(comment, commentWasm),
  withWasm(css, cssWasm),
  withWasm(json, jsonWasm),
  withWasm(javascript, javascriptWasm),
];

await mkdir(resolve(generatedDir, "fragments"), { recursive: true });

const lumis = await createHighlighter({ languages, languagePackageResolver });
const lumisOutput = lumis.highlight(source, htmlInline({ language: languages[0], theme }));
validate(lumisOutput, "Lumis JavaScript WASM");
await writeFile(resolve(generatedDir, "fragments/lumis-js-wasm.html"), lumisOutput);

const shiki = await createShikiHighlighter({
  langs: ["html"],
  themes: ["dracula"],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});
const shikiOutput = shiki.codeToHtml(source, { lang: "html", theme: "dracula" });
validate(shikiOutput, "Shiki");
await writeFile(resolve(generatedDir, "fragments/shiki.html"), shikiOutput);
shiki.dispose();

const highlightJsTheme = await readFile(
  fileURLToPath(import.meta.resolve("highlight.js/styles/base16/dracula.css")),
  "utf8",
);
const highlightJsOutput = `<style>${highlightJsTheme}</style><pre><code class="hljs language-html">${
  highlightJs.highlight(source, { language: "html" }).value
}</code></pre>`;
validate(highlightJsOutput, "highlight.js");
await writeFile(resolve(generatedDir, "fragments/highlight-js.html"), highlightJsOutput);

function validate(output, implementation) {
  if (
    Buffer.byteLength(output) <= Buffer.byteLength(source) ||
    !output.includes("<pre") ||
    !output.includes("<span")
  ) {
    throw new Error(`${implementation} did not produce highlighted HTML`);
  }
}
