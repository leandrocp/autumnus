import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import highlightJs from "highlight.js";
import { createHighlighter as createShikiHighlighter } from "shiki";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import { createHighlighter, runtimeKind, withWasm } from "@lumis-sh/lumis";
import { htmlInline } from "@lumis-sh/lumis/formatters";
import bash from "@lumis-sh/lumis/langs/bash";
import comment from "@lumis-sh/lumis/langs/comment";
import css from "@lumis-sh/lumis/langs/css";
import elixir from "@lumis-sh/lumis/langs/elixir";
import go from "@lumis-sh/lumis/langs/go";
import heex from "@lumis-sh/lumis/langs/heex";
import html from "@lumis-sh/lumis/langs/html";
import javascript from "@lumis-sh/lumis/langs/javascript";
import json from "@lumis-sh/lumis/langs/json";
import markdown from "@lumis-sh/lumis/langs/markdown";
import markdownInline from "@lumis-sh/lumis/langs/markdown_inline";
import java from "@lumis-sh/lumis/langs/java";
import rust from "@lumis-sh/lumis/langs/rust";
import tsx from "@lumis-sh/lumis/langs/tsx";
import theme from "@lumis-sh/themes/dracula";
import bashWasm from "@lumis-sh/wasm-bash";
import commentWasm from "@lumis-sh/wasm-comment";
import cssWasm from "@lumis-sh/wasm-css";
import elixirWasm from "@lumis-sh/wasm-elixir";
import goWasm from "@lumis-sh/wasm-go";
import heexWasm from "@lumis-sh/wasm-heex";
import htmlWasm from "@lumis-sh/wasm-html";
import javascriptWasm from "@lumis-sh/wasm-javascript";
import jsonWasm from "@lumis-sh/wasm-json";
import markdownWasm from "@lumis-sh/wasm-markdown";
import markdownInlineWasm from "@lumis-sh/wasm-markdown_inline";
import javaWasm from "@lumis-sh/wasm-java";
import rustWasm from "@lumis-sh/wasm-rust";
import tsxWasm from "@lumis-sh/wasm-tsx";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const generatedDir = resolve(benchmarksDir, "showcase/generated");
const assetsDir = resolve(generatedDir, "assets");
const documents = JSON.parse(await readFile(resolve(assetsDir, "documents.json"), "utf8"));
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
  withWasm(rust, rustWasm),
  withWasm(elixir, elixirWasm),
  withWasm(heex, heexWasm),
  withWasm(go, goWasm),
  withWasm(markdown, markdownWasm),
  withWasm(markdownInline, markdownInlineWasm),
  withWasm(bash, bashWasm),
  withWasm(java, javaWasm),
  withWasm(tsx, tsxWasm),
];
const byId = new Map(languages.map((language) => [language.id, language]));

const lumis = await createHighlighter({ languages, languagePackageResolver });
const lumisId = runtimeKind() === "native" ? "lumis-js-node" : "lumis-js-wasm";
const shiki =
  process.env.BENCH_SHOWCASE_LUMIS_ONLY === "1"
    ? undefined
    : await createShikiHighlighter({
        langs: [...new Set(documents.map((document) => document.language))],
        themes: ["dracula"],
        engine: createOnigurumaEngine(import("shiki/wasm")),
      });
const highlightJsTheme = await readFile(
  fileURLToPath(import.meta.resolve("highlight.js/styles/base16/dracula.css")),
  "utf8",
);

for (const document of documents) {
  const fragmentsDir = resolve(generatedDir, "fragments", document.id);
  await mkdir(fragmentsDir, { recursive: true });
  const source = await readFile(resolve(assetsDir, document.file), "utf8");
  const language = byId.get(document.language);
  if (!language)
    throw new Error(`showcase document names an unloaded language: ${document.language}`);

  const lumisOutput = lumis.highlight(source, htmlInline({ language, theme }));
  validate(lumisOutput, source, lumisId);
  await writeFile(resolve(fragmentsDir, `${lumisId}.html`), lumisOutput);

  // The runtime is chosen once per process, so the showcase runs this script twice
  // to render both. Shiki and highlight.js do not vary with it, and rebuilding the
  // Oniguruma engine for a second identical result is the slowest step here.
  if (!shiki) continue;

  const shikiOutput = shiki.codeToHtml(source, { lang: document.language, theme: "dracula" });
  validate(shikiOutput, source, "Shiki");
  await writeFile(resolve(fragmentsDir, "shiki.html"), shikiOutput);

  const highlightJsOutput =
    `<style>${highlightJsTheme}</style><pre><code class="hljs language-${document.language}">` +
    `${highlightJs.highlight(source, { language: document.language }).value}</code></pre>`;
  validate(highlightJsOutput, source, "highlight.js");
  await writeFile(resolve(fragmentsDir, "highlight-js.html"), highlightJsOutput);
}

shiki?.dispose();

function validate(output, source, implementation) {
  if (
    Buffer.byteLength(output) <= Buffer.byteLength(source) ||
    !output.includes("<pre") ||
    !output.includes("<span")
  ) {
    throw new Error(`${implementation} did not produce highlighted HTML`);
  }
}
