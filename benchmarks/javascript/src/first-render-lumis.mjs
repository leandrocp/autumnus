import { readFile } from "node:fs/promises";
import { assertHtml, nsSince } from "./common.mjs";

const fixture = process.argv[2];
if (!fixture) throw new Error("usage: first-render-lumis.mjs <fixture>");

const totalStarted = process.hrtime.bigint();
const readStarted = process.hrtime.bigint();
const source = await readFile(fixture, "utf8");
const readNs = nsSince(readStarted);

const importStarted = process.hrtime.bigint();
const [
  { createHighlighter, withWasm },
  { htmlInline },
  { default: rust },
  { default: theme },
  wasm,
] = await Promise.all([
  import("@lumis-sh/lumis"),
  import("@lumis-sh/lumis/formatters"),
  import("@lumis-sh/lumis/langs/rust"),
  import("@lumis-sh/themes/github_dark"),
  import("@lumis-sh/wasm-rust"),
]);
const importNs = nsSince(importStarted);
const afterImport = process.memoryUsage();

const initStarted = process.hrtime.bigint();
const language = withWasm(rust, wasm.default);
const highlighter = await createHighlighter({ languages: [language] });
const formatter = htmlInline({ language, theme });
const initNs = nsSince(initStarted);
const afterInit = process.memoryUsage();

const renderStarted = process.hrtime.bigint();
const output = highlighter.highlight(source, formatter);
const renderNs = nsSince(renderStarted);
const afterRender = process.memoryUsage();
assertHtml(output, source.length, "Lumis JS");

console.log(
  JSON.stringify({
    schemaVersion: 1,
    implementation: "lumis-js",
    scenario: "library-first-render",
    fixture,
    readNs,
    importNs,
    initNs,
    renderNs,
    internalTotalNs: nsSince(totalStarted),
    inputBytes: Buffer.byteLength(source),
    outputBytes: Buffer.byteLength(output),
    maxRssBytes: process.resourceUsage().maxRSS * 1024,
    memory: { afterImport, afterInit, afterRender },
  }),
);
