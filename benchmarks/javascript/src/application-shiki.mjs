import { assertHtml, nsSince } from "./common.mjs";

const totalStarted = process.hrtime.bigint();
const fixtureStarted = process.hrtime.bigint();
const { applicationInputBytes, applicationSnippetCount, applicationWorkload } =
  await import("./application-workload.mjs");
const fixtureNs = nsSince(fixtureStarted);
const importStarted = process.hrtime.bigint();
const [{ createHighlighter }, { createOnigurumaEngine }] = await Promise.all([
  import("shiki"),
  import("shiki/engine/oniguruma"),
]);
const importNs = nsSince(importStarted);
const afterImport = process.memoryUsage();

const initStarted = process.hrtime.bigint();
const highlighter = await createHighlighter({
  langs: applicationWorkload.map((entry) => entry.language),
  themes: ["github-dark"],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});
const initNs = nsSince(initStarted);
const afterInit = process.memoryUsage();

const renderStarted = process.hrtime.bigint();
let outputBytes = 0;
for (const entry of applicationWorkload) {
  for (const source of entry.snippets) {
    const output = highlighter.codeToHtml(source, {
      lang: entry.language,
      theme: "github-dark",
    });
    assertHtml(output, Buffer.byteLength(source), `Shiki (${entry.language})`);
    outputBytes += Buffer.byteLength(output);
  }
}
const renderNs = nsSince(renderStarted);
const afterRender = process.memoryUsage();
highlighter.dispose();

console.log(
  JSON.stringify({
    schemaVersion: 1,
    implementation: "shiki",
    scenario: "application-two-languages-six-snippets",
    languages: applicationWorkload.map((entry) => entry.language),
    snippetCount: applicationSnippetCount,
    fixtureNs,
    importNs,
    initNs,
    renderNs,
    internalTotalNs: nsSince(totalStarted),
    inputBytes: applicationInputBytes,
    outputBytes,
    maxRssBytes: process.resourceUsage().maxRSS * 1024,
    memory: { afterImport, afterInit, afterRender },
  }),
);
