import { readFile } from "node:fs/promises";
import { assertHtml, nsSince } from "./common.mjs";

const fixture = process.argv[2];
if (!fixture) throw new Error("usage: first-render-shiki.mjs <fixture>");

const totalStarted = process.hrtime.bigint();
const readStarted = process.hrtime.bigint();
const source = await readFile(fixture, "utf8");
const readNs = nsSince(readStarted);

const importStarted = process.hrtime.bigint();
const [{ createHighlighter }, { createOnigurumaEngine }] = await Promise.all([
  import("shiki"),
  import("shiki/engine/oniguruma"),
]);
const importNs = nsSince(importStarted);
const afterImport = process.memoryUsage();

const initStarted = process.hrtime.bigint();
const highlighter = await createHighlighter({
  langs: ["rust"],
  themes: ["github-dark"],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});
const initNs = nsSince(initStarted);
const afterInit = process.memoryUsage();

const renderStarted = process.hrtime.bigint();
const output = highlighter.codeToHtml(source, { lang: "rust", theme: "github-dark" });
const renderNs = nsSince(renderStarted);
const afterRender = process.memoryUsage();
assertHtml(output, source.length, "Shiki");
highlighter.dispose();

console.log(
  JSON.stringify({
    schemaVersion: 1,
    implementation: "shiki",
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
